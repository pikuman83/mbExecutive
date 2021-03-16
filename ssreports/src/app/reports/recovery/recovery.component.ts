// This component handles Customer Recovery (2 reports) & Supplier Payment Reports.
//Receives 3 arguments FILENAME, TITLE & DATAtoBRINGforgetparty method.
//if report is supplier payment, the city needs to be hidden? 

import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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

  //balance, iphone, 3.... 
  // <flanacomponent [atype]="2">
  //<input> all products atype= 2

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

  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  party: any;
  pgrp: string[];
  // city: string[];

  getparty(table: string): void { this.service.get('Reports/?table=' + table).subscribe(x => {this.party = x;this.initilizeFilter()})}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  // getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}
  
  initilizeFilter(){
    this.filteredOptions = this.accInput.valueChanges.pipe(startWith(''),map(value => this._filter(value)));
  }
  private _filter(value: string): string[] {return this.party.filter(x => {
      if (x.col1.includes(value)||x.col2.toLowerCase().includes(value.toString().toLowerCase()))return x;})}
  
  public displayProperty(value) {
    if (value) {
      return value.col1;
    }
  }
  aname='';
  showName(e: MatAutocompleteSelectedEvent){
    this.aname = e.option.value.col2;
  }

  generate(party: string, param4: string){
    if(party.trim()) party = this.party.some(x => x.col1 === party)? party:'All';
      else party = 'All'
    this.service.genReport("mb", this.fileName, this.datefrom.toDateString(), this.dateto.toDateString(),party,param4,"","", "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
