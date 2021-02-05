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
    this.initialize();
  }

  param3: boolean = false;
  param4:  boolean = false;
  param5:  boolean = false;
  param6:  boolean = false;
  dateto = new Date();
  datefrom = new Date(this.dateto);

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy,MM,dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy,MM,dd");
  }

  code: any[];
  getCustomers(): void {
    this.service.get('Reports/?sp=customers').subscribe(x => this.code = x)
  }
  generate(Icode: string, date1: Date, date2: Date){
    if(Icode.trim()){
      const isValid = this.code.some(x => x.code === Icode);
      if (isValid){
        this.service.downloadPDF("SalesInv", date1.toDateString(), date2.toDateString(),"","","","","","").subscribe((data) => {
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

  initialize(){
    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }

    if (this.title === "Customer Ledger") {
      this.getCustomers();
      this.param3 = true;
    }
  }
}
