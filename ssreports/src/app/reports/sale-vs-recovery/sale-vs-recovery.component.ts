import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-sale-vs-recovery',
  templateUrl: './sale-vs-recovery.component.html'
})
export class SaleVsRecoveryComponent implements OnInit {
  pgrp: string[];
  city: string[];
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<SaleVsRecoveryComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    this.getpgrp();
    this.getcities();
  }

  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}

  generate(pgrp: string, city: string){
    this.service.genReport('mb', 'SALVSREC', this.datefrom, this.dateto, pgrp, city,'','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
