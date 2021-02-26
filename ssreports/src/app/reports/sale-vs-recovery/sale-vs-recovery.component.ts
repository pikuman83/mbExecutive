import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-sale-vs-recovery',
  templateUrl: './sale-vs-recovery.component.html'
})
export class SaleVsRecoveryComponent implements OnInit {
        
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<SaleVsRecoveryComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    this.getpgrp();
    this.getcities();
  }

  pgrp: string[];
  city: string[];

  dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
  datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')
  getpgrp(): void { this.service.get('Reports/?table=pgroup').subscribe(x => this.pgrp = x.map(y => y.col1))}
  getcities(): void { this.service.get('Reports/?table=city').subscribe(x => this.city = x.map(y => y.col1))}
  
  generate(pgrp: string, city: string, datefrom: any, dateto: any){
    this.service.genReport('mb', 'SALVSREC', datefrom.toDateString(), dateto.toDateString(), pgrp, city,'','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}