import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {constructor(private http: HttpClient, private datepipe: DatePipe) {}

  title: string;
  baseUrl = environment.apiUrl;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }),
  };

  httpOptionsPdf = {
    responseType: 'blob' as 'json',
    headers: new HttpHeaders({
      'Content-Type': 'application/Blob',
      'Accept': 'application/pdf',
    }),
  };

  login(user: any) {
    return this.http.post(this.baseUrl + '/RequestToken', user);
  }

  post(data: any, path: string) {
    return this.http.post(this.baseUrl+'/'+path, data);
  }

  genReport(path: string, id:string, datefrom: Date | string, dateto: Date | string, param3: string, param4: string, param5:string, param6: string, param7: string): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/${path}/?id=${id}&param1=${from}&param2=${to}&param3=${param3.toUpperCase()}&param4=${param4.toUpperCase()}&param5=${param5.toUpperCase()}&param6=${param6.toUpperCase()}&param7=${param7.toUpperCase()}`, this.httpOptionsPdf)
  }

  get(path: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${path}`, this.httpOptions)
  }

  getcash(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=cash&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getbbalance(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=bbalance&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getreceivable(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=receivable&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => res && Math.round(res ?? 0)))
  }

  getpayable(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=payable&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getSaleAmount(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=saleamount&datefrom=${from}&dateto=${to}`).pipe(map(amount => Math.round(amount ?? 0)))
  }

  getSaleRecovery(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=salerecovery&datefrom=${from}&dateto=${to}`).pipe(map(recovery => Math.round(recovery ?? 0)))
  }

  getCashSale(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=cashSale&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getCreditSale(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=creditSale&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getCheques(dateto: Date): Observable<any> {
    const date = this.formatDate(dateto);
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=pdcCheques&datefrom=&dateto=${date}`, this.httpOptions).pipe(map(res => Math.round(res ?? 0)))
  }

  getTOP10(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SLTOP10&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      if (res && res.length) {
        res.forEach(product => {
          top10.push({ name: `${product.pname} (${product.qty})`, value: product.qty })
        });
      }
      return top10;
    }));
  }

  getSOTOP10(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SOTOP10&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          top10.push(object)
        }
      return top10;
    }));
  }

  getsales(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const sales = {
      "name": "Sales",
      "series": []
    }

    return this.http.get<any>(`${this.baseUrl}/SP?sp=sales&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          sales.series.push(object)
        }
      return sales;
    }));
  }

  getsaleorder(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const orders = {
      "name": "Orders",
      "series": []
    }

    return this.http.get<any>(`${this.baseUrl}/SP?sp=saleorder&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          orders.series.push(object)
        }
      return orders;
    }));
  }

  getproduction(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const production = {
      "name": "Productions",
      "series": []
    }

    return this.http.get<any>(`${this.baseUrl}/SP?sp=production&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          production.series.push(object)
        }
      return production;
    }));
  }

  getexpenses(datefrom: Date, dateto: Date): Observable<any> {
    const from = this.formatDate(datefrom);
    const to = this.formatDate(dateto);

    const expenses: any[] = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=expenses&datefrom=${from}&dateto=${to}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          expenses.push(object)
        }
      return expenses;
    }));
  }

  private formatDate(date: string | Date): string {
    if (!date) return '';
    return typeof date === 'string' ? date : date.toISOString().split('T')[0];
}
}
