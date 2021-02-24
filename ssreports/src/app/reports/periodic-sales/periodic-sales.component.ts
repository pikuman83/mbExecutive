import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-periodic-sales',
  templateUrl: './periodic-sales.component.html'
})
export class PeriodicSalesComponent implements OnInit {
    
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<PeriodicSalesComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getparty();
    this.getpgrp();
    this.getmgrp();
    this.getlocations();
    this.transformDateFrom();
    this.transformDateto();
  }

  dateto = new Date();
  datefrom = new Date(this.dateto);
  order: string = 'Party';
  type: string = 'Detail';

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy-MM-dd");
  }

  party: any;
  mgrp: string[];
  pgrp: string[];
  locations: string[];

  getparty(): void { this.service.get('Reports/?table=customers').subscribe(x => this.party = x)}
  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getlocations(): void { this.service.get('Reports/?table=location').subscribe(x => this.locations = x.map(y => y.col1))}
  
  generate(party: string, mgrp: string, pgrp: string, godown: string){
    this.service.genReport("mb", this.genFilename(this.order, this.type), this.datefrom.toDateString(), this.dateto.toDateString(), !party.trim()?party:'All', mgrp, pgrp, godown, "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
  genFilename(order: string, type: string){
    if(this.title === 'Periodic Sale'){
      if(order === 'Party' && type === 'Detail') return 'SaleRepPartyWise'
      if(order === 'Party' && type === 'Summary') return 'SaleRepPartyWiseSumm'
      if(order === 'Product' && type === 'Detail') return 'SaleRepPrdWise'
      if(order === 'Product' && type === 'Summary') return 'SaleRepPrdWiseSumm'
      if(order === 'Invoice' && type === 'Detail') return 'SaleRepInvWise'
      if(order === 'Invoice' && type === 'Summary') return 'SaleRepInvWiseSumm'
    }
    else{
      if(order === 'Party' && type === 'Detail') return 'PurRepPartyWise'
      if(order === 'Party' && type === 'Summary') return 'PurRepPartyWiseSumm'
      if(order === 'Product' && type === 'Detail') return 'PurRepPrdWise'
      if(order === 'Product' && type === 'Summary') return 'PurRepPrdWiseSumm'
      if(order === 'Invoice' && type === 'Detail') return 'PurRepInvWise'
      if(order === 'Invoice' && type === 'Summary') return 'PurRepInvWiseSumm'
    }
  }
}