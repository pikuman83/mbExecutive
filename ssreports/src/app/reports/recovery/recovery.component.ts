// This component handles Customer Recovery (2 reports) & Supplier Payment Reports.
//Receives 3 arguments FILENAME, TITLE & DATAtoBRINGforgetparty method.
//if report is supplier payment, the city needs to be hidden? 

import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-recovery',
  templateUrl: './recovery.component.html'
})
export class RecoveryComponent implements OnInit {
  
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<RecoveryComponent>,
    @Inject(MAT_DIALOG_DATA) public id: any[]) {}

  ngOnInit(): void {
    this.getparty(this.id[2]);
    this.getpgrp();
    // this.getcities();
    this.transformDateFrom();
    this.transformDateto();
  }

  dateto = new Date();
  datefrom = new Date(this.dateto);
  fileName: string = this.id[0]; //ngmodel with radio button to assign report name

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy-MM-dd");
  }

  party: any;
  pgrp: string[];
  // city: string[];

  getparty(table: string): void { this.service.get('Reports/?table=' + table).subscribe(x => this.party = x)}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  // getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}
  
  generate(param3: string, param4: string){
    this.service.genReport("mb", this.fileName, this.datefrom.toDateString(), this.dateto.toDateString(),param3,param4,"","", "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
