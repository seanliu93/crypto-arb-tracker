import { Component, OnInit, Input } from '@angular/core';
import { TickerMessage } from '../app.component';
import { CurrencyPipe } from '@angular/common';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';
import { CryptoCompareService } from '../services/crypto-compare.service';

@Component({
  selector: 'trading-pair-card',
  templateUrl: './trading-pair-card.component.html',
  styleUrls: ['./trading-pair-card.component.css'],
  providers: [ CurrencyPipe ],
  animations: [
    trigger('green-blink', [
      state('green', style({
          color: 'green',
      })),
      state('normal', style({
          color: 'black',
      })),
      transition('green => normal', animate('500ms ease-in')),
    ]),
  ]
})
export class TradingPairCardComponent implements OnInit {

  @Input() tickerData: TickerMessage;
  blinkState: string;
  lastPrice: number;
  priceColorState: string;
  constructor(private currencyPipe: CurrencyPipe, private cryptoCompareService: CryptoCompareService) { }

  ngOnInit() {
    console.log("Showing tickerData...");
    this.lastPrice = this.tickerData.price;
    this.tickerData.lastUpdateDate = new Date(this.tickerData.lastUpdate*1000);
  }

  ngOnChanges() {
    if (this.tickerData.price > this.lastPrice) {
      this.priceColorState = "green";
    }
    else if (this.tickerData.price < this.lastPrice) {
      this.priceColorState = "red";
    }
    else {
      this.priceColorState = "normal";
    }
    this.tickerData.lastUpdateDate = new Date(this.tickerData.lastUpdate*1000);
  }

  changeState() {
    this.blinkState = 'green';
    this.blinkState = 'normal';
  }

  getPrice(): string {
    if (this.tickerData.toCurrency == 'USD') {
      return this.currencyPipe.transform(this.tickerData.price, this.tickerData.toCurrency, true);
      // return "tickerData.price | currency:tickerData.toCurrency:true"
    }
    else {
      return this.currencyPipe.transform(this.tickerData.price, this.tickerData.toCurrency, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.price/this.cryptoCompareService.usd_jpy_rate, 'USD', true) + ' ) ';
    }
  }

  getLastVolumeTo(): string {
    if (this.tickerData.toCurrency == 'USD') {
      return this.currencyPipe.transform(this.tickerData.lastVolumeTo, this.tickerData.toCurrency, true);
      // return "tickerData.price | currency:tickerData.toCurrency:true"
    }
    else {
      return this.currencyPipe.transform(this.tickerData.lastVolumeTo, this.tickerData.toCurrency, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.price/this.cryptoCompareService.usd_jpy_rate, 'USD', true) + ' ) ';
    }
  }

}
