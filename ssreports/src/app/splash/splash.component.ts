import { Component, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.css']
})
export class SplashComponent implements AfterViewInit {

  constructor(private router: Router) { }

  ngAfterViewInit(): void {
    this.router.navigate(['/dashboard'])
  }

}
