import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import {Resolve,RouterStateSnapshot,ActivatedRouteSnapshot} from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators'
import { GlobalService } from './global.service';

@Injectable({
  providedIn: 'root'
})
export class ResolveResolver implements Resolve<any> {
  constructor(private service: GlobalService, private datepipe: DatePipe) {}
  
  dateto = new Date();
  datefrom = new Date(this.dateto);
  transformDateFrom(){this.datefrom.setDate(this.datefrom.getDate() - 30);
    return this.datepipe.transform(this.datefrom, "yyyy-MM-dd");}
  transformDateto(){return this.datepipe.transform(this.dateto, "yyyy-MM-dd");}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return forkJoin([
      this.service.getcash(this.transformDateto()),
      this.service.getbbalance(this.transformDateto()),
      this.service.getreceivable(this.transformDateto()),
      this.service.getpayable(this.transformDateto()),
      this.service.getTOP10(this.transformDateFrom(),this.transformDateto()),
      this.service.getsales(this.transformDateFrom(),this.transformDateto()),
      this.service.getexpenses(this.transformDateFrom(),this.transformDateto()),
      this.service.getSaleAmount(this.transformDateFrom(),this.transformDateto()),
      this.service.getSaleRecovery(this.transformDateFrom(),this.transformDateto()),
      this.service.getSOTOP10(this.transformDateFrom(),this.transformDateto()),
      this.service.getsaleorder(this.transformDateFrom(),this.transformDateto()),
      this.service.getproduction(this.transformDateFrom(),this.transformDateto())
    ]).pipe(map(result => {
      return {
        cash: result[0],
        bbalance: result[1],
        receivable: result[2],
        payable: result[3],
        top10: result[4],
        expenses: result[6],
        salevsrecovery: [result[7], result[8]],
        top10SO: result[9],
        oVssVsp: [result[5], result[10], result[11]]
      };
    }));
  }
}