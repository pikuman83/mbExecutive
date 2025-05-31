import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-pdc-cheque',
  templateUrl: './pdc-cheque.component.html'
})
export class PdcChequeComponent implements OnInit {
  form: FormGroup;
  pgrp: string[] = [];
  parties: any[] = [];
  customerCode: string = '';
  filteredOptions: Observable<string[]>;

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<PdcChequeComponent>, private fb: FormBuilder) {
    this.form = this.fb.group({
      dateto: [new Date().toISOString().split('T')[0]],
      customers: [''],
      productGroup: [''],
    });
  }

  ngOnInit(): void {
    this.getparty();
    this.getpgrp();
  }

  private getparty(): void {
    this.service.get('Reports/?table=customers').pipe(take(1)).subscribe(x => {this.parties = x; this.initilizeFilter()})
  }

  private getpgrp(): void {
    this.service.get('Reports/?table=pgroup').pipe(take(1)).subscribe(x => this.pgrp = x.map(y => y.col1))
  }

  initilizeFilter(){
      this.filteredOptions = this.form.get('customers')!.valueChanges.pipe(startWith(''),map(value => this._filter(value)));
  }

  private _filter(value: string): any[] {return this.parties.filter(x => {
        if (x.col1.includes(value)||x.col2.toLowerCase().includes(value.toString().toLowerCase()))return x;})}

  public displayProperty(party) {
    return party?.col2 ?? '';
  }

  showCode(e: MatAutocompleteSelectedEvent){
    const party = e.option.value;
    this.customerCode = party?.col1 ? `code: ${party.col1}` : '';
  }

  generate(): void {
    const formData = this.form.value;
    const selectedCustomer = formData.customers?.col1 ?? '';
    const selectedGroup = formData.productGroup ?? '';
    const dateto = formData.dateto ?? new Date().toISOString().split('T')[0];

    this.service.genReport("mb", "PdcChqRep", "", dateto, selectedCustomer, selectedGroup, "", "", "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });

    this.dialogRef.close();
  }
}
