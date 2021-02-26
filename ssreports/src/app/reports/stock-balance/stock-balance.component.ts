import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-stock-balance',
  templateUrl: './stock-balance.component.html'
})
export class StockBalanceComponent implements OnInit {
      
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<StockBalanceComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    // this.getparty();
    // this.getpgrp();
    // this.getmgrp();
    // this.getsize();
    // this.getstyp();
    // this.getarticle();
    // this.gettyp();
    this.getlocations()
  }

  date = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
  header = "All";
  // party: any;
  // mgrp: string[];
  // pgrp: string[];
  // size: string[];
  // shoestyp: string[];
  // article: string[];
  // typ: string[];
  locations: any[];
  
  // getparty(): void { this.service.get('Reports/?table=customers').subscribe(x => this.party = x)}
  // getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  // getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  // getsize(): void { this.service.get('Reports/?table=size').subscribe(x => this.size = x.map(y => y.col1))}//size from products
  // getstyp(): void { this.service.get('Reports/?table=shoestyp').subscribe(x => this.shoestyp = x.map(y => y.col1))}
  // getarticle(): void { this.service.get('Reports/?table=article').subscribe(x => this.article = x.map(y => y.col1))}
  // gettyp(): void { this.service.get('Reports/?table=typ').subscribe(x => this.typ = x.map(y => y.col1))}
  getlocations(): void { this.service.get('Reports/?table=location').subscribe(x => this.locations = x)};
  
  generate(godown: any){
    godown = godown&&godown!=='All'?godown.col2:'All';
    this.service.genReport("mb", this.title==='Stock Balance'?'PrdBal':'STKAmnt', this.date, godown, this.header, '','','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
  // genFilename(order: string, type: string){
  //   if(this.title === 'Periodic Sale'){
  //     if(order === 'Party' && type === 'Detail') return 'SaleRepPartyWise'
  //     if(order === 'Party' && type === 'Summary') return 'SaleRepPartyWiseSumm'
  //     if(order === 'Product' && type === 'Detail') return 'SaleRepPrdWise'
  //     if(order === 'Product' && type === 'Summary') return 'SaleRepPrdWiseSumm'
  //     if(order === 'Invoice' && type === 'Detail') return 'SaleRepInvWise'
  //     if(order === 'Invoice' && type === 'Summary') return 'SaleRepInvWiseSumm'
  //   }
  //   else{
  //     if(order === 'Party' && type === 'Detail') return 'PurRepPartyWise'
  //     if(order === 'Party' && type === 'Summary') return 'PurRepPartyWiseSumm'
  //     if(order === 'Product' && type === 'Detail') return 'PurRepPrdWise'
  //     if(order === 'Product' && type === 'Summary') return 'PurRepPrdWiseSumm'
  //     if(order === 'Invoice' && type === 'Detail') return 'PurRepInvWise'
  //     if(order === 'Invoice' && type === 'Summary') return 'PurRepInvWiseSumm'
  //   }
  // }
}