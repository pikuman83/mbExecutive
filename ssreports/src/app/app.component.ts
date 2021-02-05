import { GlobalService } from './global.service';
import { Spinkit } from 'ng-http-loader'
import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AccountsReceivableComponent } from './reports/accounts-receivable/accounts-receivable.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Special Executive Dashboard';

  constructor(public service: GlobalService, private router: Router, @Inject(DOCUMENT) private document: any, public dialog: MatDialog) {}

  ngOnInit(): void {
    this.elem = document.documentElement;
  }

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
    if (localStorage.getItem('player') != null){
      this.username = localStorage.getItem('player');
      return true
    }
    else {
      return false
    }
  }

  signOut(){
    localStorage.removeItem('player');
    localStorage.removeItem('theepa');
    this.isLogin();
    this.username = '';
    this.router.navigate(['/Login']);
  }

  openDialogue(title: string){
    const dialogRef = this.dialog.open(AccountsReceivableComponent,
      // title === 'b'? CustomerLedgerComponent: 
      // title ==='c'? CustomerLedgerComponent: 
      // CustomerLedgerComponent, 
      {width: '450px', disableClose:true, autoFocus:true, data:title});
  }
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

