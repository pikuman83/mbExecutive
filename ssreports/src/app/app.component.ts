import { GlobalService } from './global.service';
import { Spinkit } from 'ng-http-loader'
import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountsReceivableComponent } from './reports/accounts-receivable/accounts-receivable.component';
import { CustomerLedgerComponent } from './reports/customer-ledger/customer-ledger.component';
import { MulipleBasicComponent } from './reports/muliple-basic/muliple-basic.component';
import { RecoveryComponent } from './reports/recovery/recovery.component';
import { Subject } from 'rxjs';
import { PeriodicSalesComponent } from './reports/periodic-sales/periodic-sales.component';
import { ProductLedgerComponent } from './reports/product-ledger/product-ledger.component';
import { StockBalanceComponent } from './reports/stock-balance/stock-balance.component';
import { PasswordComponent } from './login/password/password.component';
import { SaleVsProductionComponent } from './reports/sale-vs-production/sale-vs-production.component';
import { SaleVsRecoveryComponent } from './reports/sale-vs-recovery/sale-vs-recovery.component';
import { FastSalesSummaryComponent } from './reports/fast-sales-summary/fast-sales-summary.component';
import { PoStatusComponent } from './reports/po-status/po-status.component';
import { PoStatusPwComponent } from './reports/po-status-pw/po-status-pw.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Special Executive Dashboard';

  constructor(public service: GlobalService, private router: Router, @Inject(DOCUMENT) private document: any, public dialog: MatDialog) {
    this.putTimer();
    this.userInactive.subscribe(() => {
      this.signOut();
    })
  }

  ngOnInit(): void {
    this.elem = document.documentElement;
  }

// ___________________________________________ The following section with constructor's methods logout the user if inactive for 30 minutes.
  idle: any;
  userInactive: Subject<any> = new Subject();

  putTimer() {
    this.idle = setTimeout(() => this.userInactive.next(), 1800000);
  }

  @HostListener('window:keydown')
  @HostListener('window:mousemove')
  checkUserActivity() {
    clearTimeout(this.idle);
    this.putTimer();
  }
  // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

  collapsed1:boolean = false;
  collapsed2:boolean = false;
  collapsed3:boolean = false;
  collapsed4:boolean = false;
  collapsed5:boolean = false;
  collapsed6:boolean = false;

  spinnerStyle = Spinkit;
  elem: any; 
  // isFullScreen: boolean;

  testReport(){}

  username: string;
  isLogin(){
    if (sessionStorage.getItem('player') != null){
      this.username = sessionStorage.getItem('player');
      return true
    }
    else {
      return false
    }
  }

  signOut(){
    sessionStorage.removeItem('player');
    sessionStorage.removeItem('theepa');
    this.isLogin();
    this.username = ''; //hides the menu button when logout
    this.router.navigate(['/Login']);
  }
  
  passwordChange(){const dialogRef = this.dialog.open(PasswordComponent,{width: '450px', disableClose:true, autoFocus:true})};
  cBalance(id: string){const dialogRef = this.dialog.open(AccountsReceivableComponent,{width: '450px', disableClose:true, autoFocus:true, data:id})};
  ledger(title: string, id: string){const dialogRef = this.dialog.open(CustomerLedgerComponent,{width: '450px', disableClose:true, autoFocus:true, data:[title, id]})};
  mBasic(id: string, title: string){const dialogRef = this.dialog.open(MulipleBasicComponent,{width: '450px', disableClose:true, autoFocus:true, data:[id, title]})};
  recovery(id: string, title: string, data: string){const dialogRef = this.dialog.open(RecoveryComponent,{width: '450px', disableClose:true, autoFocus:true, data:[id, title, data]})}
  periodicSales(title: string){const dialogRef = this.dialog.open(PeriodicSalesComponent,{width: '450px', disableClose:true, autoFocus:true, data:title})};
  productLedger(title: string){const dialogRef = this.dialog.open(ProductLedgerComponent,{width: '450px', disableClose:true, autoFocus:true, data:title})};
  stockBalance(title: string){const dialogRef = this.dialog.open(StockBalanceComponent,{width: '450px', maxWidth:600, disableClose:true, autoFocus:true, data:title, panelClass: 'custom-dialog-container'})}
  saleVsProduction(title: string){const dialogRef = this.dialog.open(SaleVsProductionComponent,{width: '450px', disableClose:true, autoFocus:true, data:title})};
  saleVsRecovery(title: string){const dialogRef = this.dialog.open(SaleVsRecoveryComponent,{width: '450px', disableClose:true, autoFocus:true, data:title})};
  fastSale(){const dialogRef = this.dialog.open(FastSalesSummaryComponent,{width: '450px', disableClose:true, autoFocus:true})};
  poStatus(file: string){const dialogRef = this.dialog.open(PoStatusComponent,{width: '450px', disableClose:true, autoFocus:true, data: file})};
  poStatusPW(file: string){const dialogRef = this.dialog.open(PoStatusPwComponent,{width: '450px', disableClose:true, autoFocus:true, data: file})};
}


    // @HostListener('document:fullscreenchange', ['$event'])
  // fullscreenmodes(event){
  //   this.chkScreenMode();
  // }
  // chkScreenMode(){
  //   if(document.fullscreenElement){
  //     this.isFullScreen = true;
  //   }else{
  //     this.isFullScreen = false;
  //   }
  // }
  // openFullscreen() {
  //   if (this.elem.requestFullscreen) {
  //     this.elem.requestFullscreen();
  //   } 
  // }
  // closeFullscreen() {
  //   if (this.document.exitFullscreen) {
  //     this.document.exitFullscreen();
  //   } 
  // }

