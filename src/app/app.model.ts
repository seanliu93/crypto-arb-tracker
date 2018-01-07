export const FLAG_PRICEUP = "1";
export const FLAG_PRICEDOWN = "2";
export const FLAG_PRICEUNCHANGED = "4";

// structure of the message object we receive as part of websocket subscription to CryptoCompare API
export interface CCCType {
  FLAGS: string;
  FROMSYMBOL: string;
  LASTTRADEID: number;
  LASTUPDATE: number;
  LASTVOLUME: number;
  LASTVOLUMETO: number;
  MARKET: string;
  PRICE: number;
  TOSYMBOL: string;
  TYPE: string;
  VOLUME24HOUR: number;
  VOLUME24HOURTO: number;
}

export interface TradePairTick {
  price: number;
  fromCurrency: string;
  toCurrency: string;
  lastUpdate: number;
  lastVolume: number;
  lastVolumeTo: number;
  market: string;
  volume24Hr: number;
  volume24HrTo: number;
}

export interface GDAXRestType {
  ask: string;
  bid: string;
  price: string;
  size: string;
  time: string;
  trade_id: number;
  volume: string;
}

// object structure for a row in the price spread table
export interface ArbPair {
  trade_pair: string;
  price_spread: number;
  buy_exchange_price: number;
  buy_exchange_name: string;
  sell_exchange_price: number;
  sell_exchange_name: string;
  conversions: string;
}
  