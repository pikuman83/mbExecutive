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
    public dialogRef: MatDialogRef<FastSalesSummaryComponent>) {}

    dateto = new Date();
    datefrom = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    generate(Icode: string){
      this.service.genReport("mb", 'FastSaleSumm', this.datefrom, this.dateto, Icode, "" ,"","","").subscribe((data) => {
        const blob = new Blob([data], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);
        window.open(downloadURL, '_blank')
      });
      this.dialogRef.close();
    }
  }
