export class TickerMessage {
    type: number;
    exchangeName: string;
    fromCurrency: string;
    toCurrency: string;
    flag: number;
    price: number;
    lastUpdate: number;
    lastUpdateDate: Date;
    lastVolume: number;
    lastVolumeTo: number;
    lastTradeId: number;
    volume24H: number;
    volume24HTo: number;
    maskInt: number;
  
    constructor(msg:string) {
      let msgArray: string[] = msg.split("~");
      this.type = parseInt(msgArray[0]);
      this.exchangeName = msgArray[1];
      this.fromCurrency = msgArray[2];
      this.toCurrency = msgArray[3];
      this.flag = parseInt(msgArray[4]);
      this.price = parseFloat(msgArray[5]);
      this.lastUpdate = parseFloat(msgArray[6]);
      this.lastVolume = parseFloat(msgArray[7]);
      this.lastVolumeTo = parseFloat(msgArray[8]);
      this.lastTradeId = parseInt(msgArray[9]);
      this.volume24H = parseFloat(msgArray[10]);
      this.volume24HTo = parseFloat(msgArray[11]);
      this.maskInt = parseInt(msgArray[12]);
    }
  }

export interface ArbPair {
    trade_pair: string;
    price_spread: number;
    buy_exchange_price: number;
    buy_exchange_name: string;
    sell_exchange_price: number;
    sell_exchange_name: string;
    conversions: string;
  }
  