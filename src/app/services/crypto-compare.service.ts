import { Observable, BehaviorSubject } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { TickerMessage, ArbPair } from '../app.model';

const CRYPTO_COMPARE_URL = 'wss://streamer.cryptocompare.com';
const HOUR_MS = 1000*60*60;

@Injectable()
export class CryptoCompareService {
  // socket connection to cryptoCompare websocket api
  private socket;
  // usd/jpy exchange rate
  public usd_jpy_rate: number;
  // exchange data keyed by exchangeName
  public exchangesMap: Map<string, TickerMessage> = new Map<string, TickerMessage>();
  public exchangeRates: Map<string, number> = new Map<string, number>();
  private exchangesReady: boolean;
  private exchangeRatesReady: boolean;
  private arbPairDataStream: BehaviorSubject<ArbPair[]>;

  constructor(private http: HttpClient) {
    // get usd/jpy exchange rate and update every hr
    TimerObservable.create(0, HOUR_MS).subscribe(() => {
      this.getExchangeRates().subscribe(data => {
        // console.log("get USD_JPY_rate");
        // console.log(data);
        Object.keys(data.rates).forEach(toCurrency => {
          let key = "USD_"+toCurrency;
          let value = data.rates[toCurrency];
          this.exchangeRates.set(key, value);
          console.log("set rate for "+key);
        });
      })
    });
    this.getCurrentPrices();
    // this.getPairs(['a', 'b', 'c', 'd'])
  }
  
  isExchangesReady() {
    return this.exchangesReady;
  }

  isExchangeRatesReady() {
    return this.exchangeRatesReady;
  }
  // get current prices using cryptoCompare's websocket api. populates exchangesMap
  getCurrentPrices() {
    console.log("in pricesObs");
    if (this.socket) {
      this.socket.disconnect();
    }
    console.log("initializing socket");
    this.socket = io(CRYPTO_COMPARE_URL);
    console.log("socket connection completed");
    this.socket.emit('SubAdd', { subs: CRYPTOCOMPARE_SUBSCRIPTIONS});

    console.log("socket subscribed");
    console.log(this.socket);
    this.socket.on('m', (data) => {
      // let msgArray = data.split("~");
      // console.log(msgArray[1]+": "+msgArray[5]);
      let tickerData: TickerMessage = new TickerMessage(data);
      // console.log(tickerData.exchangeName+": "+tickerData.price);
      if (tickerData.exchangeName != 'LOADCOMPLETE') {
        let key: string = tickerData.exchangeName+"_"+tickerData.fromCurrency+"_"+tickerData.toCurrency;
        // console.log("setting key: "+key);
        this.exchangesMap.set(key, tickerData);
        if (this.exchangesMap.size == CRYPTOCOMPARE_SUBSCRIPTIONS.length && !this.exchangesReady) {
          console.log("EXCHANGES READY");
          this.exchangesReady = true;
          this.arbPairDataStream = new BehaviorSubject<ArbPair[]>([]);
        }
        if (this.exchangesReady) {
          this.arbPairDataStream.next(this.getArbPairData());
        }
      }
    });
  }

  getArbPairDataStream(): BehaviorSubject<ArbPair[]> {
    return this.arbPairDataStream;
  }

  buildArbPairs(keys: string[]) {
    
  }

  // gets the pair combinations of the array
  getArbPairData(): ArbPair[] {
    let exchangeKeys: string[] = Array.from(this.exchangesMap.keys());
    let arbPairData = new Array<ArbPair>();
    // get the pair combinations of the array
    for (let i = 0; i < exchangeKeys.length-1; i++) {
      for (let j = i+1; j < exchangeKeys.length; j++) {
        let keyPair1: string = exchangeKeys[i];
        let keyPair2: string = exchangeKeys[j];
        let fromCurrency1: string = keyPair1.split("_")[1];
        let fromCurrency2: string = keyPair2.split("_")[1];
        if (fromCurrency1 == fromCurrency2) {
          let trdPair1: TickerMessage = this.exchangesMap.get(keyPair1);
          let trdPair2: TickerMessage = this.exchangesMap.get(keyPair2);
          if (trdPair1.price < trdPair2.price) {
            let temp = trdPair1;
            trdPair1 = trdPair2;
            trdPair2 = temp;
          }
          let trdPair1Price: number = this.getUsdPrice(trdPair1);
          let trdPair2Price: number = this.getUsdPrice(trdPair2);

          let price_spread = trdPair1Price/trdPair2Price - 1;
          let arbPair: ArbPair = {
            trade_pair: fromCurrency1+" / USD",
            price_spread: price_spread,
            buy_exchange_price: trdPair2Price,
            buy_exchange_name: trdPair2.exchangeName,
            sell_exchange_price: trdPair1Price,
            sell_exchange_name: trdPair1.exchangeName,
            conversions: "None"
          };
          if (trdPair1.toCurrency != 'USD' || trdPair2.toCurrency != 'USD') {
            let toCurrency: string = trdPair1.toCurrency != 'USD' ? trdPair1.toCurrency : trdPair2.toCurrency;
            arbPair.conversions = "USD / "+toCurrency+": "+this.exchangeRates.get('USD_'+toCurrency);
          }
          arbPairData.push(arbPair);
          // console.log(price_spread);
          // console.log(fromCurrency1+" Spread "+trdPair1.exchangeName+" to "+trdPair2.exchangeName+": "+price_spread*100+"%");
          // console.log(fromCurrency1+" Spread "+trdPair1.exchangeName+" to "+trdPair2.exchangeName+": "+trdPair1Price+"-"+trdPair2Price);
        }
      }
    }
    return arbPairData;
  }

  getUsdPrice(tickerMessage: TickerMessage): number {
    if (tickerMessage.toCurrency != 'USD') {
      let exchangeRateKey: string = 'USD_'+tickerMessage.toCurrency;
      return tickerMessage.price/this.exchangeRates.get(exchangeRateKey);
    }
    else {
      return tickerMessage.price;
    }
  }

  getExchangeRates(): Observable<any> {
    return this.http.get('https://api.fixer.io/latest?base=USD&symbols=JPY,KRW');
  }

  onDestroy() {
    this.socket.emit('SubRemove', { subs: CRYPTOCOMPARE_SUBSCRIPTIONS});
    this.socket.disconnect();
  }
}

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