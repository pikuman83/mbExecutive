// Validate party and put value to All
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
  }


  order: string = 'Party';
  type: string = 'Detail';
  party: any;
  mgrp: string[];
  pgrp: string[];
  locations: string[];
  dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
  datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();

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

  getparty(): void { this.service.get('Reports/?table=customers').subscribe(x => {this.party = x; this.initilizeFilter()})}
  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getlocations(): void { this.service.get('Reports/?table=location').subscribe(x => this.locations = x)}
  
  generate(party: string, mgrp: string, pgrp: string, godown: any, datefrom: any, dateto: any){
    party = !party.trim()?'All':party;
    if(!this.party.some(x => x.col1 === party)) party = 'All';
    this.service.genReport("mb", this.genFilename(this.order, this.type), datefrom.toDateString(), dateto.toDateString(), party.trim()?party:'All', mgrp, pgrp, godown, "").subscribe((data) => {
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
    else if(this.title === 'Periodic Purchase'){
      if(order === 'Party' && type === 'Detail') return 'PurRepPartyWise'
      if(order === 'Party' && type === 'Summary') return 'PurRepPartyWiseSumm'
      if(order === 'Product' && type === 'Detail') return 'PurRepPrdWise'
      if(order === 'Product' && type === 'Summary') return 'PurRepPrdWiseSumm'
      if(order === 'Invoice' && type === 'Detail') return 'PurRepInvWise'
      if(order === 'Invoice' && type === 'Summary') return 'PurRepInvWiseSumm'
    }
    else{
      if(order === 'Party' && type === 'Detail') return 'GRNRepPartyWise'
      if(order === 'Party' && type === 'Summary') return 'GRNRepPartyWiseSumm'
      if(order === 'Product' && type === 'Detail') return 'GRNRepPrdWise'
      if(order === 'Product' && type === 'Summary') return 'GRNRepPrdWiseSumm'
      if(order === 'Invoice' && type === 'Detail') return 'GRNRepInvWise'
      if(order === 'Invoice' && type === 'Summary') return 'GRNRepInvWiseSumm'
    }
  }
}