import { Observable, BehaviorSubject } from 'rxjs';
import * as Rx from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { TimerObservable } from "rxjs/observable/TimerObservable";
import { ArbPair, CCCType, FLAG_PRICEDOWN, FLAG_PRICEUP, FLAG_PRICEUNCHANGED } from '../app.model';

// currently not using websocket api
const GDAX_SOCKET_URL = 'wss://ws-feed.gdax.com';
const HOUR_MS = 1000*60*60;

const GDAX_REST_URL = 'https://api.gdax.com';
// available product ids for REST api
export const GDAX_REST_BTC_USD = 'BTC-USD';
export const GDAX_REST_ETH_USD = 'ETH-USD';
// websocket subscription
export const GDAX_SUBSCRIPTION = {
    "product_ids": [
        "BTC-USD",
        "ETH-USD"
    ],
    "channels": [
        "level2",
        "heartbeat",
        {
            "name": "ticker",
            "product_ids": [
                "BTC-USD",
                "ETH-USD",
            ]
        }
    ]
};

declare var CCC: any;

@Injectable()
export class GdaxService {
    private socket;

    constructor(private http: HttpClient) {
    }

    // gives CORS error since we're using a client side socket connection which is current not supported by gdax. will use rest api for now
    initSocketConnection() {
        if (this.socket) {
        this.socket.disconnect();
        }
        console.log("initializing gdax socket");
        this.socket = io(GDAX_SOCKET_URL);
        console.log("gdax socket connection completed");
        this.socket.emit('subscribe', GDAX_SUBSCRIPTION);
        this.socket.on('subscriptions', (data) => {
            console.log("gdax sub received");
            console.log(data);
        });  
    }

    getPriceTickerRest(product_id: string): Observable<any> {
        return this.http.get(GDAX_REST_URL+'/products/'+product_id+'/ticker');
    }

    onDestroy() {
        if (this.socket) {
            this.socket.emit('unsubscribe', GDAX_SUBSCRIPTION);
            this.socket.disconnect();
        }
    }
}