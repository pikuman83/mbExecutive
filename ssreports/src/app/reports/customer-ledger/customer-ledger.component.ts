//this voucher will handle all the ledger reports.

import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
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
    @Inject(MAT_DIALOG_DATA) public title: string[]) {}

    ngOnInit(): void {
      this.getAccounts();
    }

    filteredOptions: Observable<string[]>;
    accInput = new FormControl();
    dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
    datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')

    code: any[];
    getAccounts(): void {
      if (this.title[1]=== 'Lgrrep') this.service.get('Reports/?table=account').subscribe(x => {this.code = x;
        this.initilizeFilter()});
      if (this.title[1]=== 'CustLgr') this.service.get('Reports/?table=customers').subscribe(x => {this.code = x;
        this.initilizeFilter()});
      if (this.title[1]=== 'SuppLgr') this.service.get('Reports/?table=suppliers').subscribe(x => {this.code = x;
        this.initilizeFilter()});
      if (this.title[1]=== 'Cash') this.service.get('Reports/?table=Cash').subscribe(x => {this.code = x;
        this.initilizeFilter()});
    }
    initilizeFilter(){
      this.filteredOptions = this.accInput.valueChanges.pipe(startWith(''),map(value => this._filter(value)));
    }
    private _filter(value: string): string[] {return this.code.filter(x => {
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
    generate(datefrom: any, dateto: any, Icode: string){
      if(Icode.trim()) Icode = this.code.some(x => x.col1 === Icode)? Icode:'All';
      else Icode = 'All'
      this.service.genReport("mb", this.title[1], datefrom.toString(), dateto.toString(), Icode, "" ,"","","").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
  }




  // this.transformDateFrom();
    // this.transformDateto();
    // dateto = new Date();
    // datefrom = new Date(this.dateto);
    // transformDateFrom(){
    //   this.datefrom.setDate(this.datefrom.getDate() - 30);
    //   return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");
    // }
    // transformDateto(){return this.datepipe.transform(this.dateto, "yyyy-MM-dd");}
