import { GlobalService } from './global.service';
import { Spinkit } from 'ng-http-loader'

import { Component, OnInit, HostListener, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Special Executive Reports';

  constructor(public service: GlobalService, @Inject(DOCUMENT) private document: any) {}

  ngOnInit(): void {
    this.elem = document.documentElement;
  }

  collapsed3:boolean = false;
  spinnerStyle = Spinkit;
  elem: any; 
  isFullScreen: boolean;

  @HostListener('document:fullscreenchange', ['$event'])
  fullscreenmodes(event){
    this.chkScreenMode();
  }
  chkScreenMode(){
    if(document.fullscreenElement){
      this.isFullScreen = true;
    }else{
      this.isFullScreen = false;
    }
  }
  openFullscreen() {
    if (this.elem.requestFullscreen) {
      this.elem.requestFullscreen();
    } 
  }
  closeFullscreen() {
    if (this.document.exitFullscreen) {
      this.document.exitFullscreen();
    } 
  }

  testReport(){
    this.service.downloadPDF("SalesInv", "","","","","","").subscribe((data) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      var downloadURL = window.URL.createObjectURL(blob);
      window.open(downloadURL, '_blank')
    });
  }
}


