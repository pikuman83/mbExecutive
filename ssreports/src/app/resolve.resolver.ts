import { Injectable } from '@angular/core';
import {Resolve,RouterStateSnapshot,ActivatedRouteSnapshot} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ResolveResolver implements Resolve<any> {
  constructor(private service: GlobalService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return forkJoin([
      this.service.getcash(),
      this.service.getbbalance(),
      this.service.getreceivable(),
      this.service.getpayable(),
      this.service.getTOP10(),
      this.service.getsales(),
      this.service.getexpenses(),
      this.service.getSaleAmount(),
      this.service.getSaleRecovery()
    ]).pipe(map(result => {
      return {
        cash: result[0],
        bbalance: result[1],
        receivable: result[2],
        payable: result[3],
        top10: result[4],
        sales: result[5],
        expenses: result[6],
        salevsrecovery: [result[7], result[8]]
      };
    }));
  }
}