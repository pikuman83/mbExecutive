import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-customer-ledger',
  templateUrl: './customer-ledger.component.html',
  styleUrls: ['./customer-ledger.component.css']
})
export class CustomerLedgerComponent implements OnInit {

  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<CustomerLedgerComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.transformDateFrom();
    this.transformDateto();
    if (this.title === "Customer Ledger") this.getCustomers();
  }
  
  dateto = new Date();
  datefrom = new Date(this.dateto);
  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy,MM,dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy,MM,dd");
  }

  customers: any[];
  getCustomers(): void {
    this.service.get('Reports/?sp=customers').subscribe(x => this.customers = x)
  }
  generate(vcode: string, date1: Date, date2: Date){
    console.log(vcode, date1, date2);
    if(vcode.trim()){
      const isValid = this.customers.some(x => x.code === vcode);
      if (isValid){

        this.service.downloadPDF("SalesInv", date1.toDateString(), date2.toDateString(),"","","","").subscribe((data) => {
          const blob = new Blob([data], {type: 'application/pdf'});
          var downloadURL = window.URL.createObjectURL(blob);
          window.open(downloadURL, '_blank')
        });

        this.dialogRef.close();
      }
    }
    else {
      this._snackBar.open('MBFW','Must chose a valid customer');
    }
  }
}
