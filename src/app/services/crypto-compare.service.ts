import { Observable } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { TickerMessage } from '../app.component';

const CRYPTO_COMPARE_URL = 'wss://streamer.cryptocompare.com';
const HOUR_MS = 1000*60*60;

@Injectable()
export class CryptoCompareService {
  // socket connection to cryptoCompare websocket api
  private socket;
  // usd/jpy exchange rate
  public usd_jpy_rate: number;
  // exchange data keyed by exchangeName
  public exchangesMap: Map<String, TickerMessage>;

  constructor(private http: HttpClient) {
    // get usd/jpy exchange rate and update every hr
    TimerObservable.create(0, HOUR_MS).subscribe(() => {
      this.getUsdJpyRate().subscribe(data => {
        console.log("get USD_JPY_rate");
        let Data: any = data;
        this.usd_jpy_rate = Data.rates.JPY
      })
    });
  }
  
  // get current prices using cryptoCompare's websocket api
  getCurrentPricesObs(): Observable<any> {
    console.log("in pricesObs");
    let observable = new Observable(observer => {
      if (this.socket) {
        this.socket.disconnect();
      }
      console.log("initializing socket");
      this.socket = io(CRYPTO_COMPARE_URL);
      console.log("socket connection completed");
      this.socket.emit('SubAdd', { subs: [GEMINI_BTC_USD, BITFLYER_BTC_USD]});

      console.log("socket subscribed");
      console.log(this.socket);
      this.socket.on('m', (data) => {
        // console.log(data);
        observer.next(data);    
      });
      return () => {
        this.socket.emit('SubRemove', { subs: [GEMINI_BTC_USD, BITFLYER_BTC_USD]});
        this.socket.disconnect();
      };  
    })     
    return observable;
  } 

  getUsdJpyRate(): Observable<Object> {
    return this.http.get('https://api.fixer.io/latest?base=USD&symbols=JPY');
  }

  onDestroy() {
    this.socket.emit('SubRemove', { subs: [GEMINI_BTC_USD, BITFLYER_BTC_USD]});
    this.socket.disconnect();
  }
}

// cryptoCompare subscriptions
export const GEMINI_BTC_USD = '2~Gemini~BTC~USD';
export const BITFLYER_BTC_USD = '2~bitFlyer~BTC~JPY';