import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable} from 'rxjs';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  constructor(private http: HttpClient, private datepipe: DatePipe) {}

  public title: string;
  public user: string;
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

  dateto = this.datepipe.transform(new Date, "yyyy,MM,dd");
  date1 = new Date(this.dateto);
  date2 = this.date1.setDate(this.date1.getDate() - 30);
  datefrom = this.datepipe.transform(this.date2, "yyyy,MM,dd");

  downloadPDF(id:string, param1: string, param2: string, param3: string, param4: string, param5:string, param6: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/mb/?id=${id}&param1=${param1}&param2=${param2}&param3=${param3}&param4=${param4}&param5=${param5}&param6=${param6}`, this.httpOptions1)
  }
  getcash(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=cash&datefrom=&dateto=${this.dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))
  }
  getbbalance(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=bbalance&datefrom=&dateto=${this.dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))
  }
  getreceivable(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=receivable&datefrom=&dateto=${this.dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))
  }
  getpayable(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=payable&datefrom=&dateto=${this.dateto}`, this.httpOptions).pipe(map(res => {return Math.round(res)}))
  }
  getSaleAmount(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=saleamount&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(amount => {
      return Math.round(amount);
    }))
  }
  getSaleRecovery(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/SPvalues?sp=salerecovery&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(recovery => {
      return Math.round(recovery);
    }))
  }
  getTOP10(): Observable<any> {
    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SLTOP10&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          top10.push(object)
        }
      return top10;
    }));
  }
  getSOTOP10(): Observable<any> {
    const top10 = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=SOTOP10&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname;
          object.value= x.qty;
          top10.push(object)
        }
      return top10;
    }));
  }
  getsales(): Observable<any> {
    const sales = {
      "name": "Sales",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=sales&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          sales.series.push(object)
        }
      return sales;
    }));
  }
  getsaleorder(): Observable<any> {
    const orders = {
      "name": "Orders",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=saleorder&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          orders.series.push(object)
        }
      return orders;
    }));
  }
  getproduction(): Observable<any> {
    const production = {
      "name": "Productions",
      "series": []
    }
    return this.http.get<any>(`${this.baseUrl}/SP?sp=production&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
      for (let x of res){
        let object: any = {};
          object.name= x.pname.slice(0, 8);
          object.value= x.qty;
          production.series.push(object)
        }
      return production;
    }));
  }
  getexpenses(): Observable<any> {
    const expenses: any[] = [];
    return this.http.get<any>(`${this.baseUrl}/SP?sp=expenses&datefrom=${this.datefrom}&dateto=${this.dateto}`).pipe(map(res => {
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
// *** keeping this data in case theres any issue with dates, move to this plan, change the params of the get functions with the following methods.
  // dateto = new Date();
  // datefrom = new Date(this.dateto);
  // transformDateFrom(){
  //   this.datefrom.setDate(this.datefrom.getDate() - 30);
  //   return this.datepipe.transform(this.datefrom, "yyyy,MM,dd");
  // }
  // transformDateto(){
  //   return this.datepipe.transform(this.dateto, "yyyy,MM,dd");
  // }