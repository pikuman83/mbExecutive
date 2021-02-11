import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-muliple-basic',
  templateUrl: './muliple-basic.component.html'
})
export class MulipleBasicComponent implements OnInit {

  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<MulipleBasicComponent>,
    @Inject(MAT_DIALOG_DATA) public id: string[],
    private _snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.transformDateFrom();
    this.transformDateto();
    if(this.id[0] === "Dllog") this.hideDateRange = true;
    if(this.id[0] === "ExpRpt") this.hideDate = true;
  }

  hideDate: boolean;
  hideDateRange: boolean;
  singleDate = this.datepipe.transform(Date.now(), "yyyy-MM-dd")
  dateto = new Date();  
  datefrom = new Date(this.dateto);

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy-MM-dd");
  }
  
  generate(date: Date){
    if (this.id[0] === "Dllog"){
      this.service.genReport("mb", this.id[0], date.toString(), "","","","","", "").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        var downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
    if (this.id[0] === "ExpRpt"){
      this.service.genReport("mb", this.id[0], this.datefrom.toDateString(), this.dateto.toDateString(),"","","","", "").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        var downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
  }
}
