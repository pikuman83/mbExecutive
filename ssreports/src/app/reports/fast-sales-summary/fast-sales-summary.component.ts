import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialogRef} from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-fast-sales-summary',
  templateUrl: './fast-sales-summary.component.html'
})
export class FastSalesSummaryComponent {
  
  constructor(
    private service: GlobalService, 
    private datepipe: DatePipe,
    public dialogRef: MatDialogRef<FastSalesSummaryComponent>) {}

    dateto = this.datepipe.transform(Date.now(), 'yyyy-MM-dd');
    datefrom = this.datepipe.transform(`${new Date().getFullYear()}-${new Date().getMonth()+1}-01`, 'yyyy-MM-dd')
  
    generate(datefrom: any, dateto: any, Icode: string){
      this.service.genReport("mb", 'FastSaleSumm', datefrom.toDateString(), dateto.toDateString(), Icode, "" ,"","","").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
  }