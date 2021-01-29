//rate exchange card
//pvc price card
// play with labels
//onfocus fix of calender
import { DatePipe } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { GlobalService } from '../global.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  
  constructor(private service: GlobalService, private datepipe: DatePipe, private route: ActivatedRoute) {
    this.service.title = "Dashboard";
    this.service.splashScreen = false;
  }
  
  ngOnInit(){
    const resolver = this.route.snapshot.data['resolver'];
    this.cash = resolver.cash;
    this.bbalance = resolver.bbalance;
    this.receivable = resolver.receivable;
    this.payable = resolver.payable;
    this.top10 = resolver.top10;
    this.expenses = resolver.expenses;
    this.top10SO = resolver.top10SO;
    this.oVsSVsp = resolver.oVssVsp; 
    this.saleVsRecovery(resolver.salevsrecovery);
    this.transformDateFrom();
    this.transformDateto();
    this.responsiveCharts()
  }
  
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

  refresh: boolean = false;
  showButton(){
    if (this.datefrom && this.dateto) {this.refresh = true}
    else {this.refresh = false}
  }
  refreshData(){
    this.service.datefrom = this.datefrom.toDateString();
    this.service.dateto = this.dateto.toDateString();
    this.service.getcash().subscribe(x => this.cash = x);
    this.service.getbbalance().subscribe(x => this.bbalance = x);
    this.service.getreceivable().subscribe(x => this.receivable = x);
    this.service.getpayable().subscribe(x => this.payable = x);
    this.service.getTOP10().subscribe(x => this.top10 = x);
    this.service.getexpenses().subscribe(x => this.expenses = x);
    this.service.getSOTOP10().subscribe(x => this.top10SO = x);
    this.service.getSaleAmount().subscribe(sale => {
      this.service.getSaleRecovery().subscribe(recovery => {
        this.saleVsRecovery([sale, recovery])
      })
    });
    this.service.getsaleorder().subscribe(orders => {
      this.service.getsales().subscribe(sales => {
        this.service.getproduction().subscribe(production =>{
          this.oVsSVsp = [orders, sales, production]
        })
      })
    });
  }

  responsiveCharts(){
    if(window.innerWidth<=600){this.view = [300, 200]}
    else if(window.innerWidth>600 && window.innerWidth <900){this.view = [380, 250]}
  }
  @HostListener('window:resize', ['$event'])
  responsivCharts1(event: { target: { innerWidth: number; }; }){
    if(event.target.innerWidth<=600){
      this.view = [300, 200]
    }
    else if(event.target.innerWidth>700 && event.target.innerWidth < 900){
      this.view = [380, 250]
    }
    else{
      this.view = [600, 300]
    }
  }

  // *** Remote chart options
  view = [520, 350];
  gradient: boolean = false;
  showLabels: boolean = true;
  sampleData: any = [
    {
      "name": "Qty",
      "series": [
        {
          "value": 6721,
          "name": "2016-09-17"
        },
        {
          "value": 3006,
          "name": "2016-09-23"
        },
        {
          "value": 5544,
          "name": "2016-09-17"
        },
        {
          "value": 6409,
          "name": "2016-09-15"
        },
        {
          "value": 5545,
          "name": "2016-09-22"
        }
      ]
    }
  ]
  sampleData1: any = [
    {
      "name": "Germany",
      "series": [
        {
          "name": "2010",
          "value": 7300000
        },
        {
          "name": "2011",
          "value": 8940000
        }
      ]
    },
  
    {
      "name": "USA",
      "series": [
        {
          "name": "2010",
          "value": 7870000
        },
        {
          "name": "2011",
          "value": 8270000
        }
      ]
    },

    {
      "name": "France",
      "series": [
        {
          "name": "2010",
          "value": 5000002
        },
        {
          "name": "2011",
          "value": 5800000
        }
      ]
    }
  ];
}
  // colorScheme = {domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']}