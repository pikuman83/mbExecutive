// This component handles Customer & Supplier Balance Reports.

import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-accounts-receivable',
  templateUrl: './accounts-receivable.component.html'
})
export class AccountsReceivableComponent implements OnInit {
  
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<AccountsReceivableComponent>,
    @Inject(MAT_DIALOG_DATA) public id: number,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getmgrp();
    this.getpgrp();
    this.getcities();
  }

  dateto = this.datepipe.transform(Date.now(), "yyyy-MM-dd");
  mgrp: string[];
  pgrp: string[];
  city: string[];

  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}
  
  generate(date: Date, param3: string, param4: string, param5: string){
    this.service.genReport("mb", "PrtBalRep", date.toString(), "",param3,param4,param5,this.id.toString(), "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}