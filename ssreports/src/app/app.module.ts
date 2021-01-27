import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatSlideToggleModule } from '@angular/material/slide-toggle';
// import { MatPaginatorModule } from '@angular/material/paginator';
// import { MatTableModule } from '@angular/material/table';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSortModule } from '@angular/material/sort';
// import { MatSelectModule } from '@angular/material/select';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatSliderModule } from '@angular/material/slider';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { A11yModule } from '@angular/cdk/a11y'; //Mat dialogue focus trap
// import { ScrollingModule } from '@angular/cdk/scrolling'; //Mat Scroll control
// import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    SplashComponent
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
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NgHttpLoaderModule.forRoot(),
    // MatRadioModule,
    // MatExpansionModule,
    // A11yModule,
    // ScrollingModule,
    // MatDividerModule,
    // MatAutocompleteModule,
    // MatChipsModule,
    // MatGridListModule,
    // MatSliderModule, 
    // MatSortModule,
    // MatProgressSpinnerModule,
    // MatSelectModule,
    // MatDialogModule,
    // MatPaginatorModule,
    // MatTableModule,
    // MatSlideToggleModule,
  ],
  providers: [DatePipe, {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 2500}},
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
