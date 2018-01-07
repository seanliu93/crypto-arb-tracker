import { Observable, BehaviorSubject } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { ArbPair, CCCType, FLAG_PRICEDOWN, FLAG_PRICEUP, FLAG_PRICEUNCHANGED, GDAXRestType } from '../app.model';
import { CryptoCompareService, CRYPTOCOMPARE_SUBSCRIPTIONS } from './crypto-compare.service';
import { GdaxService, GDAX_REST_BTC_USD, GDAX_REST_ETH_USD } from './gdax.service';

declare var CCC: any;
const HOUR_MS = 1000 * 60 * 60;
const GDAX_REST_INTERVAL_MS = 400;

// holds the state of the application
@Injectable()
export class AppStateService {

    // exchange data keyed by exchangeName_fromCurrency_toCurrency
    public exchangesMap: Map<string, CCCType> = new Map<string, CCCType>();
    // exchange rates keyed by fromCurrency_toCurrency
    public exchangeRates: Map<string, number> = new Map<string, number>();
    public arbPairDataStream: BehaviorSubject<ArbPair[]>;

    constructor(private gdaxService: GdaxService, private cryptoCompareService: CryptoCompareService, private http: HttpClient) {
        this.arbPairDataStream = new BehaviorSubject<ArbPair[]>([]);
        // get usd/jpy exchange rate and update every hr
        TimerObservable.create(0, HOUR_MS).subscribe(() => {
            this.cryptoCompareService.getExchangeRates().subscribe(data => {
                // console.log("get USD_JPY_rate");
                // console.log(data);
                Object.keys(data.rates).forEach(toCurrency => {
                    let key = "USD_" + toCurrency;
                    let value = data.rates[toCurrency];
                    this.exchangeRates.set(key, value);
                    console.log("set rate for " + key);
                });
            })
        });
        this.getInitialPrices();
        this.getCurrentPrices();
    }

    getArbPairDataStream() {
        return this.arbPairDataStream;
    }

    getInitialPrices() {
        CRYPTOCOMPARE_SUBSCRIPTIONS.forEach((sub) => {
            let subArray = sub.split("~");
            let exchangeName = subArray[1];
            let fromCurrency = subArray[2];
            let toCurrency = subArray[3];
            this.cryptoCompareService.getPrice(fromCurrency, toCurrency, exchangeName).subscribe((response) => {
                let key: string = exchangeName + "_" + fromCurrency + "_" + toCurrency;
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
                });
            });
        })
        this.gdaxService.getPriceTickerRest(GDAX_REST_BTC_USD).subscribe((data: GDAXRestType) => {
            let key: string = "GDAX_BTC_USD";
            let price: number = parseFloat(data.price);
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
            });
        });
        this.gdaxService.getPriceTickerRest(GDAX_REST_ETH_USD).subscribe((data) => {
            let key: string = "GDAX_ETH_USD";
            let price: number = parseFloat(data.price);
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
            });
        });
    }

    // retrieves current prices from various exchange apis and populates exchangesMap and arbPairDataStream with the data
    getCurrentPrices() {
        // get current prices for exchanges using cryptoCompare's websocket api. populates exchangesMap
        this.cryptoCompareService.getCurrentPricesObs().subscribe((cccObj: CCCType) => {
            if (cccObj.MARKET != 'LOADCOMPLETE') {
                let key: string = cccObj.MARKET + "_" + cccObj.FROMSYMBOL + "_" + cccObj.TOSYMBOL;
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
                this.arbPairDataStream.next(this.getArbPairData());
            }
        });
        TimerObservable.create(0, GDAX_REST_INTERVAL_MS).subscribe(() => {
            this.gdaxService.getPriceTickerRest(GDAX_REST_BTC_USD).subscribe((data: GDAXRestType) => {
                this.exchangesMap.set("GDAX_BTC_USD", {
                    FLAGS: null,
                    FROMSYMBOL: 'BTC',
                    LASTTRADEID: data.trade_id,
                    LASTUPDATE: new Date(data.time).getMilliseconds(),
                    LASTVOLUME: parseFloat(data.size),
                    LASTVOLUMETO: null,
                    MARKET: 'GDAX',
                    PRICE: parseFloat(data.price),
                    TOSYMBOL: 'USD',
                    TYPE: null,
                    VOLUME24HOUR: parseFloat(data.volume),
                    VOLUME24HOURTO: null
                });
                console.log(data);
            });
            this.gdaxService.getPriceTickerRest(GDAX_REST_ETH_USD).subscribe(data => {
                this.exchangesMap.set("GDAX_ETH_USD", {
                    FLAGS: null,
                    FROMSYMBOL: 'ETH',
                    LASTTRADEID: data.trade_id,
                    LASTUPDATE: new Date(data.time).getMilliseconds(),
                    LASTVOLUME: parseFloat(data.size),
                    LASTVOLUMETO: null,
                    MARKET: 'GDAX',
                    PRICE: parseFloat(data.price),
                    TOSYMBOL: 'USD',
                    TYPE: null,
                    VOLUME24HOUR: parseFloat(data.volume),
                    VOLUME24HOURTO: null
                });
                console.log(data);
            })
        });
    }

    // gets the pair combinations of the array
    getArbPairData(): ArbPair[] {
        let exchangeKeys: string[] = Array.from(this.exchangesMap.keys());
        let arbPairData = new Array<ArbPair>();
        // get the pair combinations of the array
        for (let i = 0; i < exchangeKeys.length - 1; i++) {
            for (let j = i + 1; j < exchangeKeys.length; j++) {
                let keyPair1: string = exchangeKeys[i];
                let keyPair2: string = exchangeKeys[j];
                let fromCurrency1: string = keyPair1.split("_")[1];
                let fromCurrency2: string = keyPair2.split("_")[1];
                if (fromCurrency1 == fromCurrency2) {
                    let trdPair1: CCCType = this.exchangesMap.get(keyPair1);
                    let trdPair2: CCCType = this.exchangesMap.get(keyPair2);
                    if (trdPair1.PRICE < trdPair2.PRICE) {
                        let temp = trdPair1;
                        trdPair1 = trdPair2;
                        trdPair2 = temp;
                    }
                    let trdPair1Price: number = this.getUsdPrice(trdPair1);
                    let trdPair2Price: number = this.getUsdPrice(trdPair2);

                    let price_spread = trdPair1Price / trdPair2Price - 1;
                    let arbPair: ArbPair = {
                        trade_pair: fromCurrency1 + " / USD",
                        price_spread: price_spread,
                        buy_exchange_price: trdPair2Price,
                        buy_exchange_name: trdPair2.MARKET,
                        sell_exchange_price: trdPair1Price,
                        sell_exchange_name: trdPair1.MARKET,
                        conversions: "None"
                    };

                    if (trdPair1.TOSYMBOL != 'USD' || trdPair2.TOSYMBOL != 'USD') {
                        let toCurrency: string = trdPair1.TOSYMBOL != 'USD' ? trdPair1.TOSYMBOL : trdPair2.TOSYMBOL;
                        arbPair.conversions = "USD / " + toCurrency + ": " + this.exchangeRates.get('USD_' + toCurrency);
                    }
                    arbPairData.push(arbPair);
                }
            }
        }
        return arbPairData;
    }

    getUsdPrice(tickerMessage: CCCType): number {
        if (tickerMessage.TOSYMBOL != 'USD') {
            let exchangeRateKey: string = 'USD_' + tickerMessage.TOSYMBOL;
            return tickerMessage.PRICE / this.exchangeRates.get(exchangeRateKey);
        }
        else {
            return tickerMessage.PRICE;
        }
    }

}