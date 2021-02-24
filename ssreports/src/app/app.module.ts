import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE} from '@angular/material/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { DatePipe } from '@angular/common';
import { SplashComponent } from './splash/splash.component';
import { CustomerLedgerComponent } from './reports/customer-ledger/customer-ledger.component';
import { ProxyInterceptor } from './proxy.interceptor';
import { AccountsReceivableComponent } from './reports/accounts-receivable/accounts-receivable.component';
import { MatSelectModule } from '@angular/material/select';
import { MulipleBasicComponent } from './reports/muliple-basic/muliple-basic.component';
import { RecoveryComponent } from './reports/recovery/recovery.component';
import { MatRadioModule} from '@angular/material/radio';
import { MatBottomSheetModule} from '@angular/material/bottom-sheet';
import { PromptComponentComponent } from './prompt-component/prompt-component.component';
import { PwaService } from './pwa.service';
import { PeriodicSalesComponent } from './reports/periodic-sales/periodic-sales.component';
import { StockBalanceComponent } from './reports/stock-balance/stock-balance.component';
import { ProductLedgerComponent } from './reports/product-ledger/product-ledger.component';
import {MatDialogModule } from '@angular/material/dialog';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

const initializer = (pwaService: PwaService) => () => pwaService.initPwaPrompt();

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    SplashComponent,
    CustomerLedgerComponent,
    AccountsReceivableComponent,
    MulipleBasicComponent,
    RecoveryComponent,
    PromptComponentComponent,
    PeriodicSalesComponent,
    StockBalanceComponent,
    ProductLedgerComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    MatSnackBarModule,
    MatSidenavModule,
    MatIconModule,
    MatCardModule, 
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatMenuModule, 
    MatListModule,
    NgxChartsModule,
    MatRadioModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgHttpLoaderModule.forRoot(),
    MatSelectModule,
    MatBottomSheetModule,
    MatDialogModule,
    MatAutocompleteModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    StockBalanceComponent
  ],
  providers: [DatePipe, 
    { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    { provide: APP_INITIALIZER, useFactory: initializer, deps: [PwaService], multi: true},
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    { provide: HTTP_INTERCEPTORS, useClass: ProxyInterceptor, multi: true}  
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
