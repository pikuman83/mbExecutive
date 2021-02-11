//this voucher will handle all the ledger reports.

import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-customer-ledger',
  templateUrl: './customer-ledger.component.html'
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
      this.getAccounts();
    }
  
    dateto = new Date();
    datefrom = new Date(this.dateto);
  
    transformDateFrom(){
      this.datefrom.setDate(this.datefrom.getDate() - 30);
      return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");
    }
    transformDateto(){
      return this.datepipe.transform(this.dateto, "yyyy-MM-dd");
    }
  
    code: any[];
    getAccounts(): void {
      if (this.title[1]=== 'Lgrrep') this.service.get('Reports/?table=account').subscribe(x => this.code = x);
      if (this.title[1]=== 'CustLgr') this.service.get('Reports/?table=customers').subscribe(x => this.code = x);
      if (this.title[1]=== 'SuppLgr') this.service.get('Reports/?table=suppliers').subscribe(x => this.code = x);
      if (this.title[1]=== 'Cash') this.service.get('Reports/?table=Cash').subscribe(x => this.code = x);
    }
    generate(datefrom: string, dateto: string, Icode: string){
      const isValid = this.code.some(x => x.col1 === Icode);
      if (isValid){
        this.service.genReport("mb", this.title[1], datefrom, dateto, Icode, "" ,"","","").subscribe((data) => {
          const blob = new Blob([data], {type: 'application/pdf'});
          const downloadURL = window.URL.createObjectURL(blob);
          window.open(downloadURL, '_blank')
        });
        this.dialogRef.close();
      }
      else {
        this._snackBar.open('MBFW','Must chose a valid Account');
      }
    }
  }