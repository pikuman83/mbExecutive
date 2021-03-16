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
  selector: 'app-po-status-pw',
  templateUrl: './po-status-pw.component.html'
})
export class PoStatusPwComponent implements OnInit {
  
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<PoStatusPwComponent>,
    @Inject(MAT_DIALOG_DATA) public file: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getAccounts();
    this.getmgrp();
  }

  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
  datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')
  mgrp: string[];
  code: any[];

  getAccounts(): void {this.service.get(`Reports/?table=${this.file === 'SOPrdRptNew'? 'product': 'raw'}`).subscribe(x => {this.code = x;this.initilizeFilter()});}
  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  initilizeFilter(){this.filteredOptions = this.accInput.valueChanges.pipe(startWith(''),map(value => this._filter(value)));}

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
  generate(datefrom: any, dateto: any, Icode: string, zb: any, maingrp: string){
    maingrp = !maingrp?'SELECT':maingrp;
    zb = zb.checked === true?'1':'0';
    Icode = !Icode.trim()?'All':Icode;
    let isValid = this.code.some(x => x.col1 === Icode);
    if(Icode==='All') isValid = true;
    if (isValid){
      console.log(Icode, zb, maingrp)
      this.service.genReport("mb", this.file, datefrom.toDateString(), dateto.toDateString(), Icode, zb ,maingrp,"","").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
    else {
      this._snackBar.open('MBFW','Must chose a valid Customer');
    }
  }
}
