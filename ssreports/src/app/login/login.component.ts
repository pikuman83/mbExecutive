// To use security, only uncomment ngOninit line and uncomment(fix) the submit method
// also uncomment the interceptor import and provider in app.module
// Process: The login methd makes a post request to the back with username and password oject, back checks and 
// compare the credentials in the db and send back a token which is in res of the subsrciber of the services's login method.
// if there is no error we save it in the sessionStorage else we show the authorization failed
// once saved we also change the user variable's value located in service and send the navigate order to the splash screen
// then chillar take charge to check if that user exists and open the route.
// next step will be to show the hello user with a funny icon and provide the checkout option which will be sessionStorage.removeitem('token')
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
    if (sessionStorage.getItem('theepa') != null){
      this.router.navigate(['/dashboard'])
    }
  }
  
  loginuser: loginClass = {
    username: "",
    password: ""
  }

  Submit(form: loginClass) {
    this.service.login(form).subscribe((res: any) => {
        sessionStorage.setItem('theepa', res);
        sessionStorage.setItem('player', form.username);
        // this.service.user = form.username;
        this.router.navigate(['/splash']);
        this.service.splashScreen = true; //It hides the toolbar in app.componet.html meanwhile splashscreen
        document.documentElement.requestFullscreen();
      },
      err => {
        this._snackBar.open('Incorrect username or password.', 'Authentication failed.');
      }
    );
  }
}

