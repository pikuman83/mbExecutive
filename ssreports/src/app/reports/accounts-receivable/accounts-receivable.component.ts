import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-accounts-receivable',
  templateUrl: './accounts-receivable.component.html',
  styleUrls: ['./accounts-receivable.component.css']
})
export class AccountsReceivableComponent implements OnInit {
  
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<AccountsReceivableComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.initialize();
  }

  dateto = this.datepipe.transform(Date.now(), "yyyy-MM-dd");
  mgrp: string[];
  pgrp: string[];
  city: string[];

  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}
  
  generate(date: Date, param2: string, param3: string, param4: string){
    console.log(date, param2, param3, param4)
    //parms = 1: api path, 2:  .rpt file name, 3:  date, 4: main group, 5: subgroup, 6: city, 7, SP
    this.service.downloadPDF("mb", "PrtBalRep", date.toString(), param2,param3,param4,"","", "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }

  initialize(){
    if (this.title === "Customer Balance") {
      this.getmgrp();
      this.getpgrp();
      this.getcities();
    }
  }
}


//Valiations
// if(param2.trim()){
      // const isValid = this.code.some(x => x.code === param2);
      // if (isValid){
    // else {
      // this._snackBar.open('MBFW','Must chose a valid customer');
    // }
  // }