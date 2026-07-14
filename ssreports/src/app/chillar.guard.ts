import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ChillarGuard implements CanActivate {

  constructor(private router: Router, private service: GlobalService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (sessionStorage.getItem('licenseExpired') === 'true') {
      this.router.navigate(['/license-expired']);
      return false;
    }
    if (sessionStorage.getItem('token') != null) {
      return true;
    }
    this.router.navigate(['/Login']);
    return false;
  }
}
