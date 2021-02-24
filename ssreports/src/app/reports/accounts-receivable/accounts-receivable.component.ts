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
      const downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
        
        // const a = document.createElement('a');
        // a.href = downloadURL;
        // a.download = 'download';
        // a.addEventListener('click', ()=> URL.revokeObjectURL(downloadURL), false);
        // a.click();
        // return a;


              // let a = document.createElement('a');
              // a.href = downloadURL;
              // a.download = fileName;
              // a.target = '_blank';
              // document.body.appendChild(a);
              // a.click();
              // document.body.removeChild(a);


    //   if (window.navigator.msSaveOrOpenBlob) {
    //     window.navigator.msSaveOrOpenBlob(blob, "_blank");
    // }
    // else if (window.navigator.userAgent.match('CriOS')) {
    //     var reader = new FileReader();
    //     reader.onloadend = function () { window.open(url1.createObjectURL(blob), '_blank')};
    //     reader.readAsDataURL(blob);
    // }
    // else if (window.navigator.userAgent.match(/iPad/i) || window.navigator.userAgent.match(/iPhone/i)) {
    //     var url = window.URL.createObjectURL(blob);
    //     window.location.href = url;
    // }
    // else {
    //     var url1 = window.URL || window.webkitURL;
    //     window.open(url1.createObjectURL(blob), '_blank');
    // }
    });
    this.dialogRef.close();
  }
}