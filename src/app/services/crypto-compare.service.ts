import { Observable, BehaviorSubject } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { ArbPair, CCCType, FLAG_PRICEDOWN, FLAG_PRICEUP, FLAG_PRICEUNCHANGED } from '../app.model';

const CRYPTO_COMPARE_URL = 'wss://streamer.cryptocompare.com';
const TEN_MINUTE_MS = 1000*60*10;

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
    this.arbPairDataStream = new BehaviorSubject<ArbPair[]>([]);
    // get usd/jpy exchange rate and update every hr
    TimerObservable.create(0, TEN_MINUTE_MS).subscribe(() => {
      this.getExchangeRates().subscribe(data => {
        console.log(data);
        // console.log("get USD_JPY_rate");
        // console.log(data);
        if (data.success) {
          Object.keys(data.quotes).forEach(currencyPair => {
            let toCurrency = currencyPair.slice(3,currencyPair.length);
            let key = "USD_"+toCurrency;
            let value = data.quotes[currencyPair];
            this.exchangeRates.set(key, value);
            console.log("set rate for "+key);
          });
        }
        else {
            console.log("ERROR: API QUERY FOR CURRENCYLAYER FAILED");
        }

      })
    });
    this.getInitialPrices();
    this.getCurrentPrices();
    // this.getPairs(['a', 'b', 'c', 'd'])
  }
  
  getInitialPrices() {
    CRYPTOCOMPARE_SUBSCRIPTIONS.forEach((sub) => {
      let subArray = sub.split("~");
      let exchangeName = subArray[1];
      let fromCurrency = subArray[2];
      let toCurrency = subArray[3];
      this.getPrice(fromCurrency, toCurrency, exchangeName).subscribe((response) => {
        let key: string = exchangeName+"_"+fromCurrency+"_"+toCurrency;
        let price: number = response[toCurrency];
        this.exchangesMap.set(key, {
          FLAGS: null,
          FROMSYMBOL: null,
          LASTTRADEID: null,
          LASTUPDATE: null,
          LASTVOLUME: null,
          LASTVOLUMETO: null,
          MARKET: null,
          PRICE: price,
          TOSYMBOL: null,
          TYPE: null,
          VOLUME24HOUR: null,
          VOLUME24HOURTO: null
        })
      })
    })
  }
  // get current prices using cryptoCompare's websocket api. populates exchangesMap
  getCurrentPrices() {
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
      // console.log(tickerData.exchangeName+": "+tickerData.price);
      let cccObj: CCCType = CCC.CURRENT.unpack(data);
      if (cccObj.MARKET != 'LOADCOMPLETE') {
        let key: string = cccObj.MARKET+"_"+cccObj.FROMSYMBOL+"_"+cccObj.TOSYMBOL;
        // console.log("setting key: "+key);
        // if (tickerData.flag != 4) {
          if (cccObj.FLAGS == FLAG_PRICEUNCHANGED) {
            // price unchanged
            if (this.exchangesMap.has(key)) {
              let lastPrice: number = this.exchangesMap.get(key).PRICE;
              if (lastPrice) {
                cccObj.PRICE = lastPrice;
                this.exchangesMap.set(key, cccObj);
              } 
            }
          }
          else {
            this.exchangesMap.set(key, cccObj);
          }

        // }
        this.arbPairDataStream.next(this.getArbPairData());
        
      }
    });
  }

  getPrice(fromCurrency: string, toCurrency: string, exchange: string): Observable<any> {
    return this.http.get('https://min-api.cryptocompare.com/data/price?fsym='+fromCurrency+'&tsyms='+toCurrency+'&e='+exchange);
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
          let trdPair1: CCCType = this.exchangesMap.get(keyPair1);
          let trdPair2: CCCType = this.exchangesMap.get(keyPair2);
          if (trdPair1.TOSYMBOL != 'USD' && trdPair2.TOSYMBOL != 'USD') {
            continue;
          }
          let trdPair1Price: number = this.getUsdPrice(trdPair1);
          let trdPair2Price: number = this.getUsdPrice(trdPair2);
          if (trdPair2.TOSYMBOL != 'USD') {
            let tempPrice = trdPair1Price;
            trdPair1Price = trdPair2Price;
            trdPair2Price = tempPrice;
            let tempPair = trdPair1;
            trdPair1 = trdPair2;
            trdPair2 = tempPair;
          }
          let price_spread = trdPair1Price/trdPair2Price - 1;
          let arbPair: ArbPair = {
            trade_pair: fromCurrency1+" / USD",
            price_spread: price_spread,
            buy_exchange_price: trdPair2Price,
            buy_exchange_name: trdPair2.MARKET,
            sell_exchange_price: trdPair1Price,
            sell_exchange_name: trdPair1.MARKET,
            conversions: "None"
          };

          if (trdPair1.TOSYMBOL != 'USD' || trdPair2.TOSYMBOL != 'USD') {
            let toCurrency: string = trdPair1.TOSYMBOL != 'USD' ? trdPair1.TOSYMBOL : trdPair2.TOSYMBOL;
            arbPair.conversions = "USD / "+toCurrency+": "+this.exchangeRates.get('USD_'+toCurrency);
          }
          arbPairData.push(arbPair);
        }
      }
    }
    return arbPairData;
  }

  getUsdPrice(tickerMessage: CCCType): number {
    if (tickerMessage.TOSYMBOL != 'USD') {
      let exchangeRateKey: string = 'USD_'+tickerMessage.TOSYMBOL;
      return tickerMessage.PRICE/this.exchangeRates.get(exchangeRateKey);
    }
    else {
      return tickerMessage.PRICE;
    }
  }

  getExchangeRates(): Observable<any> {
    return this.http.get('https://apilayer.net/api/live?access_key=f67ac08d7dc93d0e0e039e6fcb4b7f27&currencies=JPY,KRW&source=USD&format=1');
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
  '2~Bithumb~BTC~KRW',
  '2~Coincheck~BTC~JPY'
]