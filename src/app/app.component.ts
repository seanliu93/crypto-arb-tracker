import { Component } from '@angular/core';
import {MatPaginator, MatTableDataSource} from '@angular/material';
import * as io from 'socket.io-client';
import { CryptoCompareService, GEMINI_BTC_USD, BITFLYER_BTC_USD } from './services/crypto-compare.service';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[]

})
export class AppComponent {
  title = 'app';
  appReady: boolean;
  gemini_tickerData: TickerMessage;
  bitflyer_tickerData: TickerMessage;
  arb_percent: number;
  exch_grid_cols: number;
  constructor(private cryptoCompareService: CryptoCompareService, private http: HttpClient, private breakpointObserver: BreakpointObserver) {
    console.log("starting cryptocompare service...");
    breakpointObserver.observe([
      Breakpoints.HandsetLandscape,
      Breakpoints.HandsetPortrait
    ]).subscribe(result => {
      console.log(result);
      if (result.matches) {
        this.useHandsetLayout();
      }
    });
    breakpointObserver.observe([
      Breakpoints.Web,
      Breakpoints.Tablet
    ]).subscribe(result => {
      if (result.matches) {
        this.useWebLayout();
      }
    });
    let blah = false;
    this.appReady = false;
    cryptoCompareService.getCurrentPricesObs().subscribe(message => {
      // console.log("logging msg");
      var msgObj = message.split("~");
        var msg: TickerMessage = new TickerMessage(msgObj);
        // console.log(msg);
        if (!blah) {
          console.log(msgObj);
          console.log(msg);
          blah = true;
        }
        if (msg.exchangeName == 'Gemini') {
          this.gemini_tickerData = msg;
        }
        else if (msg.exchangeName == 'bitFlyer') {
          this.bitflyer_tickerData = msg;
        }
        this.appReady = this.gemini_tickerData != null && this.bitflyer_tickerData != null;
    }); 
  }

  useHandsetLayout() {
    console.log("HELLO USING HANDSETLAYOUT");
    this.exch_grid_cols = 1;
  }

  useWebLayout() {
    console.log("USING WEB LAYOUT");
    this.exch_grid_cols = 2;
  }
  getArbColor() {
    if ((((this.bitflyer_tickerData.price/113.24 / this.gemini_tickerData.price)-1) * 100) > 0) {
      return "green";
    }
    else if ((((this.bitflyer_tickerData.price/113.24 / this.gemini_tickerData.price)-1) * 100) < 0) {
      return "red";
    }
    else {
      return "normal";
    }
  }

  onDestroy() {
    this.cryptoCompareService.onDestroy();
  }
}

export class TickerMessage {
  type: number;
  exchangeName: string;
  fromCurrency: string;
  toCurrency: string;
  flag: number;
  price: number;
  lastUpdate: number;
  lastUpdateDate: Date;
  lastVolume: number;
  lastVolumeTo: number;
  lastTradeId: number;
  volume24H: number;
  volume24HTo: number;
  maskInt: number;

  constructor(msgArray: Array<string>) {
    this.type = parseInt(msgArray[0]);
    this.exchangeName = msgArray[1];
    this.fromCurrency = msgArray[2];
    this.toCurrency = msgArray[3];
    this.flag = parseInt(msgArray[4]);
    this.price = parseInt(msgArray[5]);
    this.lastUpdate = parseFloat(msgArray[6]);
    this.lastVolume = parseFloat(msgArray[7]);
    this.lastVolumeTo = parseFloat(msgArray[8]);
    this.lastTradeId = parseInt(msgArray[9]);
    this.volume24H = parseInt(msgArray[10]);
    this.volume24HTo = parseInt(msgArray[11]);
    this.maskInt = parseInt(msgArray[12]);
  }
}
