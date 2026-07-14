import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { DOCUMENT } from '@angular/common';

export interface loginClass {
  username: string;
  password: string
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private service: GlobalService, private router: Router, private _snackBar: MatSnackBar,
    @Inject(DOCUMENT) private document: any) {
    this.service.title = "Login";
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('token') != null){
      this.router.navigate(['/dashboard'])
    }
  }

  loginuser: loginClass = {
    username: "",
    password: ""
  }

  Submit(form: loginClass) {
    this.service.login(form).subscribe((res: any) => {
        sessionStorage.removeItem('licenseExpired');
        sessionStorage.setItem('token', res);
        sessionStorage.setItem('username', form.username);
        this.router.navigate(['/dashboard']);
        document.documentElement.requestFullscreen();
      },
      err => {
        this._snackBar.open('Incorrect username or password.', 'Authentication failed.');
      }
    );
  }
}
