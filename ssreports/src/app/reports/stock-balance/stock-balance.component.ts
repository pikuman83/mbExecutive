import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalService } from 'src/app/global.service';

@Component({
  selector: 'app-stock-balance',
  templateUrl: './stock-balance.component.html'
})
export class StockBalanceComponent implements OnInit {
  date = new Date().toISOString().split('T')[0];
  header = "All";
  output = '0';
  locations: any[];

  constructor(
    private service: GlobalService,
    public dialogRef: MatDialogRef<StockBalanceComponent>,
    @Inject(MAT_DIALOG_DATA) public title: string) {}

  ngOnInit(): void {
    this.getlocations()
  }

  getlocations(): void { this.service.get('Reports/?table=location').subscribe(x => this.locations = x)};

  generate(godown: any){
    const output = this.output === '0'? 'Prdbal1_Color': 'PrdBal_Color';
    this.service.genReport("mb", this.title ==='Stock Balance'? 'PrdBal' : this.title === 'Stock (color wise)'? output : 'STKAmnt',
      this.date, godown, this.header, '','','', '').subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
    this.dialogRef.close();
  }
}
