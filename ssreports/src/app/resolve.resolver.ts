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

  dateto = this.datepipe.transform(new Date(),'yyyy-MM-dd').toString();
  datefrom = this.datepipe.transform(new Date().setDate(new Date().getDate()-30),'yyyy-MM-dd').toString();

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    return forkJoin([
      this.service.getcash(this.dateto),
      this.service.getbbalance(this.dateto),
      this.service.getreceivable(this.dateto),
      this.service.getpayable(this.dateto),
      this.service.getTOP10(this.datefrom,this.dateto),
      this.service.getsales(this.datefrom,this.dateto),
      this.service.getexpenses(this.datefrom,this.dateto),
      this.service.getSaleAmount(this.datefrom,this.dateto),
      this.service.getSaleRecovery(this.datefrom,this.dateto),
      this.service.getSOTOP10(this.datefrom,this.dateto),
      this.service.getsaleorder(this.datefrom,this.dateto),
      this.service.getproduction(this.datefrom,this.dateto),
      this.service.getCashSale(this.dateto),
      this.service.getCreditSale(this.dateto),
      this.service.getCheques(this.dateto)
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
        oVssVsp: [result[5], result[10], result[11]],
        cashSale: result[12],
        creditSale: result[13],
        cheques: result[14]
      };
    }));
  }
}
