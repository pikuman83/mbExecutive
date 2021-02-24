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

  public title: string;
  public splashScreen: boolean = false;
  baseUrl = environment.apiUrl;
  
  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    }),
  };
  httpOptions1 = {
    responseType: 'blob' as 'json',
    headers: new HttpHeaders({
      'Content-Type': 'application/Blob',
      'Accept': 'application/pdf',
    }),
  };

  login(user: any) {return this.http.post(this.baseUrl + '/RequestToken', user);}

  genReport(path: string, id:string, datefrom: string, dateto: string, param3: string, param4: string, param5:string, param6: string, param7: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${path}/?id=${id}&param1=${datefrom}&param2=${dateto}&param3=${param3.toUpperCase()}&param4=${param4.toUpperCase()}&param5=${param5.toUpperCase()}&param6=${param6.toUpperCase()}&param7=${param7.toUpperCase()}`, this.httpOptions1)}
  get(path: any): Observable<any> {return this.http.get<any>(`${this.baseUrl}/${path}`, this.httpOptions)}
  getcash(dateto: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=cash&datefrom=&dateto=${dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))}
  getbbalance(dateto: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=bbalance&datefrom=&dateto=${dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))}
  getreceivable(dateto: any): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=receivable&datefrom=&dateto=${dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))}
  getpayable(dateto: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=payable&datefrom=&dateto=${dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))}
  getSaleAmount(datefrom: any, dateto: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=saleamount&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(amount => {
      return Math.round(amount);
    }))
  }
  getSaleRecovery(datefrom: any, dateto: any): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=salerecovery&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(recovery => {
      return Math.round(recovery);
    }))
  }
  getTOP10(datefrom: any, dateto: any): Observable<any> {
    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SLTOP10&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          top10.push(object)
        }
      return top10;
    }));
  }
  getSOTOP10(datefrom: any, dateto: any): Observable<any> {
    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SOTOP10&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          top10.push(object)
        }
      return top10;
    }));
  }
  getsales(datefrom: any, dateto: any): Observable<any> {
    const sales = {
      "name": "Sales",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=sales&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          sales.series.push(object)
        }
      return sales;
    }));
  }
  getsaleorder(datefrom: any, dateto: any): Observable<any> {
    const orders = {
      "name": "Orders",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=saleorder&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          orders.series.push(object)
        }
      return orders;
    }));
  }
  getproduction(datefrom: any, dateto: any): Observable<any> {
    const production = {
      "name": "Productions",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=production&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          production.series.push(object)
        }
      return production;
    }));
  }
  getexpenses(datefrom: any, dateto: any): Observable<any> {
    const expenses: any[] = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=expenses&datefrom=${datefrom}&dateto=${dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          expenses.push(object)
        }
      return expenses;
    }));
  }
}
