import { Component } from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import * as io from 'socket.io-client';
import { CryptoCompareService, CRYPTOCOMPARE_SUBSCRIPTIONS } from './services/crypto-compare.service';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { DecimalPipe } from '@angular/common';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[]

})
export class AppComponent {
  title = 'app';
  arb_percent: number;
  exch_grid_cols: number;
  exch_rate_cols: number;
  groupByActive = false;
  
  constructor(public cryptoCompareService: CryptoCompareService, private http: HttpClient, private breakpointObserver: BreakpointObserver) {
    console.log("starting cryptocompare service...");
    breakpointObserver.observe([
      Breakpoints.Handset,
    ]).subscribe(result => {
      console.log(result);
      if (result.matches) {
        this.useHandsetLayout();
      }
    });
    breakpointObserver.observe([
      Breakpoints.Web,
    ]).subscribe(result => {
      if (result.matches) {
        this.useWebLayout();
      }
    });
    breakpointObserver.observe([
      Breakpoints.Tablet
    ]).subscribe(result => {
      if (result.matches) {
        this.useTabletLayout();
      }
    });
  }

  useHandsetLayout() {
    console.log("HELLO USING HANDSETLAYOUT");
    this.exch_grid_cols = 1;
    this.exch_rate_cols = 1;
  }

  useTabletLayout() {
    console.log("HELLO USING TABLETLAYOUT");
    this.exch_grid_cols = 2;
    this.exch_rate_cols = 2;
  }

  useWebLayout() {
    console.log("USING WEB LAYOUT");
    this.exch_grid_cols = 3;
    this.exch_rate_cols = 3;
  }

  getSupportedExchanges(): Set<string> {
    let exchangeNames: Set<string> = new Set<string>();
    CRYPTOCOMPARE_SUBSCRIPTIONS.forEach((sub) => {
      let subArray: string[] = sub.split("~");
      let exchangeName: string = subArray[1];
      exchangeNames.add(exchangeName);
    })
    return exchangeNames;
  }

  getSupportedExchangesStr(): string {
    let resultStr: string = "";
    this.getSupportedExchanges().forEach((exchangeName) => {
      resultStr += exchangeName + ", "
    });
    return resultStr.slice(0, -2);
  }

  onDestroy() {
    this.cryptoCompareService.onDestroy();
  }
}

