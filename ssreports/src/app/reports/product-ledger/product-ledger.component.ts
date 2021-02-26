import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-product-ledger',
  templateUrl: './product-ledger.component.html'
})
export class ProductLedgerComponent implements OnInit {
        
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<ProductLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    this.getProducts();
    this.getlocations();
    this.transformDateFrom();
    this.transformDateto();
  }

  dateto = new Date();
  datefrom = new Date(this.dateto);
  products: any[]; //return 2 columns col1(pcode) & col2(pname)
  locations: string[];

  transformDateFrom(){this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");}
  transformDateto(){return this.datepipe.transform(this.dateto, "yyyy-MM-dd");}
  getProducts(): void { this.service.get('Reports/?table=product').subscribe(x => this.products = x)};
  getlocations(): void { this.service.get('Reports/?table=location').subscribe(x => this.locations = x)};
  
  generate(product: string, godown: any){
    godown = godown&&godown!=='All'?godown.col2:'All';
    if(product.trim() === '') product = 'All'
    this.service.genReport("mb", 'StkLgr', this.datefrom.toDateString(), this.dateto.toDateString(),product,godown,'','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
