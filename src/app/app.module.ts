import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { CryptoCompareService } from './services/crypto-compare.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import {MatCardModule} from '@angular/material/card';
import { TradingPairCardComponent } from './components/trading-pair-card/trading-pair-card.component';
import {MatListModule} from '@angular/material/list';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {LayoutModule} from '@angular/cdk/layout';
import { ArbTableComponent } from './components/arb-table/arb-table.component';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';


@NgModule({
  declarations: [
    AppComponent,
    TradingPairCardComponent,
    ArbTableComponent
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
    LayoutModule,
    MatTableModule,
    MatSortModule
  ],
  providers: [ CryptoCompareService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
