import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-muliple-basic',
  templateUrl: './muliple-basic.component.html'
})
export class MulipleBasicComponent implements OnInit {
  hideDate: boolean;
  hideDateRange: boolean;
  singleDate = new Date().toISOString().split('T')[0];
  dateto = new Date();
  datefrom = new Date();

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<MulipleBasicComponent>,
    @Inject(MAT_DIALOG_DATA) public id: string[]) {}

  ngOnInit(): void {
    this.transformDateFrom();
    const report = this.id[0];
    if(report === "Dllog") this.hideDateRange = true;
    if(report === "ExpRpt" || report === "zakat" || report === "PdcChqRep") this.hideDate = true;
  }

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
  }

  generate(){
    if (this.id[0] === "Dllog"){
      this.service.genReport("mb", this.id[0], this.singleDate, null, "", "", "", "", "").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        var downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
    if (this.id[0] === "ExpRpt" || this.id[0] === "zakat" || this.id[0] === "PdcChqRep"){
      this.service.genReport("mb", this.id[0], this.datefrom, this.dateto, "", "", "", "", "").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        var downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
  }
}
