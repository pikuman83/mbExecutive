import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { GlobalService } from '../global.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('gaugeChart') gaugeChart: any;

  @HostListener('window:resize', ['$event'])
  updateCharts(event: { target: { innerWidth: number; }; }){
    this.updateChartsDimensions(event.target.innerWidth);
  }

  // *** Remote chart options
  view = [560, 350];
  viewG = null;
  max = 1000;
  gradient: boolean = false;
  showLabels: boolean = true;
  totalDisp: number;
  totalProd: number;
  cash: number;
  bbalance: number;
  receivable: number;
  payable: number;
  sVSr: any[] = [];
  top10: any[] = [];
  expenses: any[] = [];
  top10SO: any[] = [];
  oVsSVsp: any[] = [];
  dateto = new Date();
  datefrom = new Date(this.dateto);
  cashSale: number;
  creditSale: number;
  cheques: number;
  refresh: boolean = false;

  constructor(private service: GlobalService, private datepipe: DatePipe, private route: ActivatedRoute) {
    this.service.title = "Dashboard";
    // this.service.splashScreen = false;
  }

  ngOnInit(){
    this.transformDateFrom();
    this.transformDateto();
    this.updateChartsDimensions(window.innerWidth);
    this.refreshData();
  }

  saleVsRecovery(x: any[]){
    const sale = {
      name: "Sale",
      value: x[0]
    }
    const recovery = {
      name: "Recovery",
      value: x[1]
    }
    return this.sVSr = [sale, recovery];
  }

  transformDateFrom(){
    this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy,MM,dd");
  }
  transformDateto(){
    return this.datepipe.transform(this.dateto, "yyyy,MM,dd");
  }

  showButton(){
    if (this.datefrom && this.dateto) {this.refresh = true}
    else {this.refresh = false}
  }
  refreshData(){
    this.max = 1000;
    this.service.getcash(this.dateto.toDateString()).subscribe(x => this.cash = x);
    this.service.getbbalance(this.dateto.toDateString()).subscribe(x => this.bbalance = x);
    this.service.getreceivable(this.dateto.toDateString()).subscribe(x => this.receivable = x);
    this.service.getpayable(this.dateto.toDateString()).subscribe(x => this.payable = x);
    this.service.getTOP10(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(x => this.top10 = x);
    this.service.getexpenses(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(x => this.expenses = x);
    this.service.getSOTOP10(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(x => this.top10SO = x);
    this.service.getSaleAmount(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(sale => {
      this.service.getSaleRecovery(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(recovery => {
        this.saleVsRecovery([sale, recovery])
      })
    });
    this.service.getsaleorder(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(orders => {
      this.service.getsales(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(sales => {
        this.service.getproduction(this.datefrom.toDateString(), this.dateto.toDateString()).subscribe(production =>{
          this.oVsSVsp = [orders, sales, production];
          this.totalDispatch(sales.series);
          this.totalProduction(production.series);
        })
      })
    });
    this.service.getCashSale(this.dateto.toDateString()).subscribe(x => this.cashSale = x);
    this.service.getCreditSale(this.dateto.toDateString()).subscribe(x => this.creditSale = x);
    this.service.getCheques(this.dateto.toDateString()).subscribe(x => this.cheques = x);
  }

  private updateChartsDimensions(windowWidth: number): void {
    if(windowWidth < 700){
      this.view = [300, 200];
      this.viewG = null;
    } else if(windowWidth >= 700 && windowWidth < 1200){
      this.view = [400, 280];
      this.viewG=[400, 350];
    } else{
      this.view = [600, 300];
      this.viewG=[450, 450];
    }
  }

  totalDispatch(obj:  any[]) {
    this.totalDisp = obj.map(t => t.value).reduce((acc, value) => acc + value, 0);
    return this.totalDisp;
  }

  totalProduction(obj:  any[]) {
    this.totalProd = obj.map(t => t.value).reduce((acc, value) => acc + value, 0);
    return this.totalProd;
  }
}
