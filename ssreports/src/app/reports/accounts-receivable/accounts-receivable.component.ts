// This component handles Customer & Supplier Balance Reports.

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-accounts-receivable',
  templateUrl: './accounts-receivable.component.html'
})
export class AccountsReceivableComponent implements OnInit {
  fileName: string = 'PrtBalRep';
  dateto = new Date().toISOString().split('T')[0];
  mgrp: string[];
  pgrp: string[];
  city: string[];

  constructor(private service: GlobalService, public dialogRef: MatDialogRef<AccountsReceivableComponent>,
    @Inject(MAT_DIALOG_DATA) public id: string) {}

  ngOnInit(): void {
    this.getmgrp();
    this.getpgrp();
    this.getcities();
  }

  getmgrp(): void { this.service.get('Reports/?table=mgrp').subscribe(x => this.mgrp = x.map(y => y.col1))}
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}

  generate(param3: string, param4: string, param5: string){
    this.service.genReport("mb", this.id==='0'?"PrtBalRep":this.fileName, this.dateto, '', param3, param4, param5, this.id.toString(), "").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      const downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
