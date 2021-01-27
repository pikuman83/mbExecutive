import { Component, Inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { GlobalService } from '../global.service';
import { DOCUMENT } from '@angular/common';

export interface loginClass {
  UserName: string;
  Password: string
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
    if (this.service.user === "Admin"){
      this.router.navigate(['/dashboard'])
    }
  }
  
  loginuser: loginClass = {
    UserName: "",
    Password: ""
  }

  onSubmit(form: loginClass) {
    if (form.UserName === "Admin" && form.Password === "majorSoft21") {
      this.service.user = "Admin"
      this.router.navigate(['/splash']);
      this.service.splashScreen = true;
      document.documentElement.requestFullscreen();
    }
    else this._snackBar.open('Incorrect username or password.', 'Authentication failed.');
  }
}

