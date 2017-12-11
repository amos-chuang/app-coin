export interface IBitfinexPriceModel {
    currency: string;
    mid: number;
    bid: number;
    ask: number;
    last_price: number;
    low: number;
    high: number;
    volume: number;
    timestamp: number;
}