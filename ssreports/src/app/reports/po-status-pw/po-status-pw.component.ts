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
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  mgrp: string[];
  code: any[];

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<PoStatusPwComponent>,
    @Inject(MAT_DIALOG_DATA) public file: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getAccounts();
    this.getmgrp();
  }

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
  generate(Icode: string, zb: any, maingrp: string){
    maingrp = !maingrp?'SELECT':maingrp;
    zb = zb.checked === true?'1':'0';
    Icode = !Icode.trim()?'All':Icode;
    let isValid = this.code.some(x => x.col1 === Icode);
    if(Icode==='All') isValid = true;
    if (isValid){
      this.service.genReport("mb", this.file, this.datefrom, this.dateto, Icode, zb ,maingrp,"","").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
    else {
      this._snackBar.open('MBFW','Must choose a valid Customer');
    }
  }
}
