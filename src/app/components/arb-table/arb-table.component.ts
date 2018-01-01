import { Component, OnInit, Input, ViewChild, ApplicationRef } from '@angular/core';
import { MatTableDataSource, MatSort, Sort, MatSortable } from '@angular/material';
import { DataSource } from '@angular/cdk/collections';

import { CryptoCompareService } from '../../services/crypto-compare.service';
import { TickerMessage, ArbPair } from '../../app.model';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'arb-table',
  templateUrl: './arb-table.component.html',
  styleUrls: ['./arb-table.component.css']
})
export class ArbTableComponent implements OnInit {
  dataSource: CryptoCompareDataSource | null;
  displayedColumns = ['trade_pair', 
                      'price_spread', 
                      'buy_exchange_price', 
                      'buy_exchange_name', 
                      'sell_exchange_price', 
                      'sell_exchange_name',
                      'conversions'
];
  @ViewChild(MatSort) sort: MatSort;

  constructor(private cryptoCompareService: CryptoCompareService, private applicationRef: ApplicationRef) { }

  ngOnInit() {
    this.dataSource = new CryptoCompareDataSource(this.cryptoCompareService, this.sort);
    console.log("Data source");
    console.log(this.dataSource);
  }

  ngAfterViewInit() {
    this.sort.sort(<MatSortable>{
      id: 'price_spread',
      start: 'desc'
    });
  }

  getPriceSpreadCellColor(price_spread: number) {
    if (price_spread > 0) {
      return "rgb(221,255,203)";
    }
    else if (price_spread < 0) {
      return "red";
    }
    else {
      return "white";
    }
  }

}

export class CryptoCompareDataSource extends DataSource<any> {
  dataSourceDestroyed$: Subject<boolean> = new Subject();

  constructor(private cryptoCompareService: CryptoCompareService, private _sort: MatSort) { super(); }

  connect(): Observable<ArbPair[]> {
    // Listen for any changes in the base data, sorting
    const displayDataChanges = [
      this.cryptoCompareService.getArbPairDataStream(),
      this._sort.sortChange, 
    ];
    console.log("subscribing to arbPair data stream");
    return Observable.merge(...displayDataChanges).map(() => {

      // Sort filtered data
      const sortedData = this.sortData(this.cryptoCompareService.getArbPairDataStream().value);

      return sortedData;
    });
    // return this.cryptoCompareService.getArbPairDataStream();
  }

  disconnect() { 
    this.dataSourceDestroyed$.next(true);
    this.dataSourceDestroyed$.complete();
  }

  /** Returns a sorted copy of the database data. */
  sortData(data: ArbPair[]): ArbPair[] {
    if (!this._sort.active || this._sort.direction == '') { return data; }

    return data.sort((a, b) => {
      let propertyA: number|string = '';
      let propertyB: number|string = '';

      switch (this._sort.active) {
        case 'price_spread': [propertyA, propertyB] = [a.price_spread, b.price_spread]; break;;
      }

      let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
      let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

      return (valueA < valueB ? -1 : 1) * (this._sort.direction == 'asc' ? 1 : -1);
    });
  }
}

const DUMMY_ARBPAIR_DATA = [
  { trade_pair: 'BTC/USD', price_spread: 0.15, buy_exchange_price: 15000, buy_exchange_name: 'Gemini', sell_exchange_price: 17000, sell_exchange_name: 'Coinbase', conversions: 'None'},
  { trade_pair: 'ETH/USD', price_spread: 0.6, buy_exchange_price: 660, buy_exchange_name: 'Coinbase', sell_exchange_price: 700, sell_exchange_name: 'Gemini', conversions: 'None'},
]