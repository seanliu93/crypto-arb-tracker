import { Component, OnInit, Input } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';
import { CryptoCompareService } from '../../services/crypto-compare.service';
import { CCCType, FLAG_PRICEDOWN, FLAG_PRICEUP, FLAG_PRICEUNCHANGED} from '../../app.model';

@Component({
  selector: 'trading-pair-card',
  templateUrl: './trading-pair-card.component.html',
  styleUrls: ['./trading-pair-card.component.css'],
  providers: [ CurrencyPipe ],
})
export class TradingPairCardComponent implements OnInit {

  @Input() tickerData: CCCType;
  lastUpdateDate: Date;
  priceColor: string;
  constructor(private currencyPipe: CurrencyPipe, private cryptoCompareService: CryptoCompareService) { }

  ngOnInit() {
    console.log("Showing tickerData...");
    this.lastUpdateDate = new Date(this.tickerData.LASTUPDATE*1000);
  }

  ngOnChanges() {
    if (this.tickerData.FLAGS == FLAG_PRICEUP) {
      this.priceColor = "green";
    }
    else if (this.tickerData.FLAGS == FLAG_PRICEDOWN) {
      this.priceColor = "red";
    }
    else {
      this.priceColor = "black";
    }
    this.lastUpdateDate = new Date(this.tickerData.LASTUPDATE*1000);
  }

  isCardReady(): boolean {
    return this.tickerData.FLAGS != null && 
      this.tickerData.FROMSYMBOL != null && 
      this.tickerData.LASTTRADEID != null && 
      this.tickerData.LASTUPDATE != null && 
      this.tickerData.LASTVOLUME != null && 
      this.tickerData.LASTVOLUMETO != null && 
      this.tickerData.MARKET != null && 
      this.tickerData.PRICE != null && 
      this.tickerData.TOSYMBOL != null && 
      this.tickerData.TYPE != null && 
      this.tickerData.VOLUME24HOUR != null && 
      this.tickerData.VOLUME24HOURTO != null;
  }

  getPrice(): string {
    if (this.tickerData.TOSYMBOL == 'USD') {
      return this.currencyPipe.transform(this.tickerData.PRICE, this.tickerData.TOSYMBOL, true, '0.2-2');
      // return "tickerData.PRICE | currency:tickerData.TOSYMBOL:true"
    }
    else {
      let trade_pair_key: string = "USD_" + this.tickerData.TOSYMBOL;
    
      return this.currencyPipe.transform(this.tickerData.PRICE, this.tickerData.TOSYMBOL, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.PRICE/this.cryptoCompareService.exchangeRates.get(trade_pair_key), 'USD', true, '0.2-2') + ' ) ';
    }
  }

  getLastVolumeTo(): string {
    if (this.tickerData.TOSYMBOL == 'USD') {
      return this.currencyPipe.transform(this.tickerData.LASTVOLUMETO, this.tickerData.TOSYMBOL, true, '0.2-2');
      // return "tickerData.PRICE | currency:tickerData.TOSYMBOL:true"
    }
    else {
      let trade_pair_key: string = "USD_" + this.tickerData.TOSYMBOL;
      return this.currencyPipe.transform(this.tickerData.LASTVOLUMETO, this.tickerData.TOSYMBOL, true) + ' ( ' +
        this.currencyPipe.transform(this.tickerData.LASTVOLUMETO/this.cryptoCompareService.exchangeRates.get(trade_pair_key), 'USD', true, '0.2-2') + ' ) ';
    }
  }

}
