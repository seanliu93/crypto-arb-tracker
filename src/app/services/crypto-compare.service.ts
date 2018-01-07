import { Observable, BehaviorSubject } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { ArbPair, CCCType, FLAG_PRICEDOWN, FLAG_PRICEUP, FLAG_PRICEUNCHANGED } from '../app.model';

const CRYPTO_COMPARE_SOCKET_URL = 'wss://streamer.cryptocompare.com';

// cryptoCompare subscriptions
export const CRYPTOCOMPARE_SUBSCRIPTIONS: string[] = [
  '2~Gemini~BTC~USD',
  '2~Gemini~ETH~USD',
  '2~bitFlyer~BTC~JPY',
  '2~Coinbase~BTC~USD',
  '2~Coinbase~ETH~USD',
  '2~Bithumb~ETH~KRW',
  '2~Bithumb~BTC~KRW'
]
declare var CCC: any;

@Injectable()
export class CryptoCompareService {
  // socket connection to cryptoCompare websocket api
  private socket;
  // usd/jpy exchange rate
  public usd_jpy_rate: number;
  // exchange data keyed by exchangeName
  public exchangesMap: Map<string, CCCType> = new Map<string, CCCType>();
  public exchangeRates: Map<string, number> = new Map<string, number>();
  public arbPairDataStream: BehaviorSubject<ArbPair[]>;

  constructor(private http: HttpClient) {
  }


  getPrice(fromCurrency: string, toCurrency: string, exchange: string): Observable<any> {
    return this.http.get('https://min-api.cryptocompare.com/data/price?fsym='+fromCurrency+'&tsyms='+toCurrency+'&e='+exchange);
  }

  getArbPairDataStream(): BehaviorSubject<ArbPair[]> {
    return this.arbPairDataStream;
  }

  // get current prices using cryptoCompare's websocket api. populates exchangesMap
  getCurrentPricesObs(): Observable<any> {
      if (this.socket) {
        this.socket.disconnect();
      }
      console.log("initializing cryptocompare socket");
      this.socket = io(CRYPTO_COMPARE_SOCKET_URL);
      console.log("cryptocompare socket connection completed");
      this.socket.emit('SubAdd', { subs: CRYPTOCOMPARE_SUBSCRIPTIONS});

      console.log("cryptocompare socket subscribed");
      console.log(this.socket);
      let obs: Observable<any> = Observable.create(observer => {
        this.socket.on('m', (data) => {
          // let msgArray = data.split("~");
          // console.log(msgArray[1]+": "+msgArray[5]);
          // console.log(tickerData.exchangeName+": "+tickerData.price);
          let cccObj: CCCType = CCC.CURRENT.unpack(data);
          observer.next(cccObj);
        });
        return () => console.log("observable destroyed");
      });
      return obs;
  }

  getExchangeRates(): Observable<any> {
    return this.http.get('https://api.fixer.io/latest?base=USD&symbols=JPY,KRW');
  }

  onDestroy() {
    this.socket.emit('SubRemove', { subs: CRYPTOCOMPARE_SUBSCRIPTIONS});
    this.socket.disconnect();
  }
}