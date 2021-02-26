import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Router } from "@angular/router";
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {

  constructor(private router: Router, private _snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (sessionStorage.getItem('theepa') != null) {
      const clonedReq = request.clone({
          headers: request.headers.set('Authorization', 'Bearer ' + sessionStorage.getItem('theepa'))
      });
      return next.handle(clonedReq).pipe(
          tap(
              succ => {},
              err => {
                  if (err.status == 401){
                    this._snackBar.open('You are not authorized to access this page', 'Authentication failed');
                      sessionStorage.removeItem('theepa');
                      this.router.navigate(['/Login']);
                  }
                  else if(err.status == 403)
                  this.router.navigate(['/Login']);
                  this._snackBar.open('Request has been rejected by the server due to invalid credentials', 'Authentication failed');
              }
          )
      )
  }
  else
      return next.handle(request.clone());
  }
}

