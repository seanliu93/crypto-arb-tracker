import { Component, OnInit, Input } from '@angular/core';
import { TickerMessage } from '../../app.model';
import { CurrencyPipe } from '@angular/common';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';
import { CryptoCompareService } from '../../services/crypto-compare.service';

@Component({
  selector: 'trading-pair-card',
  templateUrl: './trading-pair-card.component.html',
  styleUrls: ['./trading-pair-card.component.css'],
  providers: [ CurrencyPipe ],
})
export class TradingPairCardComponent implements OnInit {

  @Input() tickerData: TickerMessage;
  lastPrice: number;
  priceColor: string;
  constructor(private currencyPipe: CurrencyPipe, private cryptoCompareService: CryptoCompareService) { }

  ngOnInit() {
    console.log("Showing tickerData...");
    this.lastPrice = this.tickerData.price;
    this.tickerData.lastUpdateDate = new Date(this.tickerData.lastUpdate*1000);
  }

  ngOnChanges() {
    if (this.tickerData.price > this.lastPrice) {
      this.priceColor = "green";
    }
    else if (this.tickerData.price < this.lastPrice) {
      this.priceColor = "red";
    }
    else {
      this.priceColor = "black";
    }
    this.lastPrice = this.tickerData.price;
    this.tickerData.lastUpdateDate = new Date(this.tickerData.lastUpdate*1000);
  }

  getPrice(): string {
    if (this.tickerData.toCurrency == 'USD') {
      return this.currencyPipe.transform(this.tickerData.price, this.tickerData.toCurrency, true, '0.2-2');
      // return "tickerData.price | currency:tickerData.toCurrency:true"
    }
    else {
      let trade_pair_key: string = "USD_" + this.tickerData.toCurrency;
    
      return this.currencyPipe.transform(this.tickerData.price, this.tickerData.toCurrency, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.price/this.cryptoCompareService.exchangeRates.get(trade_pair_key), 'USD', true, '0.2-2') + ' ) ';
    }
  }

  getLastVolumeTo(): string {
    if (this.tickerData.toCurrency == 'USD') {
      return this.currencyPipe.transform(this.tickerData.lastVolumeTo, this.tickerData.toCurrency, true, '0.2-2');
      // return "tickerData.price | currency:tickerData.toCurrency:true"
    }
    else {
      let trade_pair_key: string = "USD_" + this.tickerData.toCurrency;
      return this.currencyPipe.transform(this.tickerData.lastVolumeTo, this.tickerData.toCurrency, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.lastVolumeTo/this.cryptoCompareService.exchangeRates.get(trade_pair_key), 'USD', true, '0.2-2') + ' ) ';
    }
  }

}
