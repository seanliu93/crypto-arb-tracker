import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CryptoCompareService } from './services/crypto-compare.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import { TradingPairCardComponent } from './trading-pair-card/trading-pair-card.component';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LayoutModule} from '@angular/cdk/layout';


@NgModule({
  declarations: [
    AppComponent,
    TradingPairCardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatListModule,
    MatGridListModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HttpClientModule,
    LayoutModule
  ],
  providers: [ CryptoCompareService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
