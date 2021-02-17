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
  idle: NodeJS.Timeout;
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
  isFullScreen: boolean;

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

  cBalance(id: string){const dialogRef = this.dialog.open(AccountsReceivableComponent,{width: '450px', disableClose:true, autoFocus:true, data:id})};
  ledger(title: string, id: string){const dialogRef = this.dialog.open(CustomerLedgerComponent,{width: '450px', disableClose:true, autoFocus:true, data:[title, id]})};
  mBasic(id: string, title: string){const dialogRef = this.dialog.open(MulipleBasicComponent,{width: '450px', disableClose:true, autoFocus:true, data:[id, title]})};
  recovery(id: string, title: string, data: string){const dialogRef = this.dialog.open(RecoveryComponent,{width: '450px', disableClose:true, autoFocus:true, data:[id, title, data]})}
  
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

