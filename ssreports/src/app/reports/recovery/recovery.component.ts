// This component handles Customer Recovery (2 reports) & Supplier Payment Reports.
//Receives 3 arguments FILENAME, TITLE & DATAtoBRINGforgetparty method.
//if report is supplier payment, the city needs to be hidden?
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
  fileName: string = this.id[0];
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  filteredOptions: Observable<string[]>;
  accInput = new FormControl();
  party: any;
  pgrp: string[];
  aname='';

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<RecoveryComponent>,
    @Inject(MAT_DIALOG_DATA) public id: any[]) {}

  ngOnInit(): void {
    this.getparty(this.id[2]);
    this.getpgrp();
  }

  getparty(table: string): void {
    this.service.get('Reports/?table=' + table).subscribe(x => {this.party = x;this.initilizeFilter()})
  }

  getpgrp(): void {
    this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))
  }

  initilizeFilter(){
    this.filteredOptions = this.accInput.valueChanges.pipe(startWith(''),map(value => this._filter(value)));
  }

  private _filter(value: string): string[] {return this.party.filter(x => {
      if (x.col1.includes(value)||x.col2.toLowerCase().includes(value.toString().toLowerCase()))return x;
    })
  }

  public displayProperty(value) {
    if (value) {
      return value.col1;
    }
  }

  showName(e: MatAutocompleteSelectedEvent){
    this.aname = e.option.value.col2;
  }

  generate(party: string, param4: string){
    if(party.trim()) party = this.party.some(x => x.col1 === party)? party:'All';
      else party = 'All'
    this.service.genReport("mb", this.fileName, this.datefrom, this.dateto, party,param4,"","", "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
