import { Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-po-status',
  templateUrl: './po-status.component.html'
})
export class PoStatusComponent implements OnInit {
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  code: any[];
  aname='';

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<PoStatusComponent>,
    @Inject(MAT_DIALOG_DATA) public file: string,
    private _snackBar: MatSnackBar) {}

    ngOnInit(): void {
      this.getAccounts();
    }

    getAccounts(): void {this.service.get(`Reports/?table=${this.file==='SORptNew'?'customers':'suppliers'}`).subscribe(x => {this.code = x;this.initilizeFilter()});}

    initilizeFilter(){this.filteredOptions = this.accInput.valueChanges.pipe(startWith(''),map(value => this._filter(value)));}

    private _filter(value: string): string[] {return this.code.filter(x => {
        if (x.col1.includes(value)||x.col2.toLowerCase().includes(value.toString().toLowerCase()))return x;})}

    public displayProperty(value) {
      if (value) {
        return value.col1;
      }
    }

    showName(e: MatAutocompleteSelectedEvent){
      this.aname = e.option.value.col2;
    }

    generate(Icode: string, zb: any){
      zb = zb.checked === true?'1':'0';
      Icode = !Icode.trim()?'All':Icode;
      let isValid = this.code.some(x => x.col1 === Icode);
      if(Icode==='All') isValid = true;
      if (isValid){
        this.service.genReport("mb", this.file, this.datefrom, this.dateto, Icode, zb ,"","","").subscribe((data) => {
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
