import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-sale-vs-production',
  templateUrl: './sale-vs-production.component.html'
})
export class SaleVsProductionComponent implements OnInit {
      
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<SaleVsProductionComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string,
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.getpgrp();
  }

  pgrp: string[];
  dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
  datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')
  getpgrp(): void { this.service.get('Reports/?table=grp').subscribe(x => this.pgrp = x.map(y => y.col1))}
  
  generate(pgrp: string, datefrom: any, dateto: any){
    this.service.genReport('mb', 'SALVSPRDTN', datefrom.toDateString(), dateto.toDateString(), pgrp, '','','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}