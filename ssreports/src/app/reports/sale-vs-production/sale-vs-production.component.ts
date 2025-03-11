import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-sale-vs-production',
  templateUrl: './sale-vs-production.component.html'
})
export class SaleVsProductionComponent implements OnInit {
  pgrp: string[];
  dateto = new Date();
  datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<SaleVsProductionComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    this.getpgrp();
  }

  getpgrp(): void { this.service.get('Reports/?table=grp').subscribe(x => this.pgrp = x.map(y => y.col1))}

  generate(pgrp: string){
    this.service.genReport('mb', 'SALVSPRDTN', this.datefrom, this.dateto, pgrp, '','','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
