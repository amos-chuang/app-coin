import * as Bluebird from "bluebird";
import * as https from "https";
import { BaseService } from "./base-service";
import { IBitfinexPriceModel } from "../models/view-models/bitfinex-price-model";
import { default as TickerHistory, ITickerHistoryModel } from "../models/db-models/ticker-history-model";
import { ICurrencyPairNameModel } from "../models/view-models/currency-pair-name-model";

export class BitfinexService {
    public static CurrencyPairs: { [name: string]: ICurrencyPairNameModel } = {
        "BTCUSD": { displayName: "BTCUSD", name: "BTCUSD" },
        "IOTUSD": { displayName: "IOTUSD", name: "IOTUSD" },
        "XMRUSD": { displayName: "XMRUSD", name: "XMRUSD" },
        "ETHUSD": { displayName: "ETHUSD", name: "ETHUSD" },
        "LTCUSD": { displayName: "LTCUSD", name: "LTCUSD" },
        "ZECUSD": { displayName: "ZECUSD", name: "ZECUSD" }
    };
    public static CurrencyPairsV2: { [name: string]: ICurrencyPairNameModel } = {
        "BTCUSD": { displayName: "BTCUSD", name: "tBTCUSD" },
        "IOTUSD": { displayName: "IOTUSD", name: "tIOTUSD" },
        "XMRUSD": { displayName: "XMRUSD", name: "tXMRUSD" },
        "ETHUSD": { displayName: "ETHUSD", name: "tETHUSD" },
        "LTCUSD": { displayName: "LTCUSD", name: "tLTCUSD" },
        "ZECUSD": { displayName: "ZECUSD", name: "tZECUSD" },
        "XRPUSD": { displayName: "XRPUSD", name: "tXRPUSD" },
        "DSHUSD": { displayName: "DSHUSD", name: "tDSHUSD" },
    };
    public static CurrencyPairsV2List: ICurrencyPairNameModel[] = [
        { displayName: "BTCUSD", name: "tBTCUSD" },
        { displayName: "IOTUSD", name: "tIOTUSD" },
        { displayName: "XMRUSD", name: "tXMRUSD" },
        { displayName: "ETHUSD", name: "tETHUSD" },
        { displayName: "LTCUSD", name: "tLTCUSD" },
        { displayName: "ZECUSD", name: "tZECUSD" },
        { displayName: "XRPUSD", name: "tXRPUSD" },
        { displayName: "DSHUSD", name: "tDSHUSD" },
    ];
    private query(currencyName: ICurrencyPairNameModel) {
        //https://api.bitfinex.com/v1/pubticker/IOTUSD
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = "api.bitfinex.com";
            options.path = "/v1/pubticker/" + currencyName.name;
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        var model = JSON.parse(output) as IBitfinexPriceModel;
                        model.currency = currencyName.displayName;
                        Bluebird.try(() => {
                            return this.insertTickerHistory(model);
                        }).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.end();
        });
    }
    public queryAll() {
        //https://api.bitfinex.com/v2/tickers?symbols=tBTCUSD,tLTCUSD,tIOTUSD
        // [
        //     SYMBOL,
        //     BID, 
        //     BID_SIZE, 
        //     ASK, 
        //     ASK_SIZE, 
        //     DAILY_CHANGE, 
        //     DAILY_CHANGE_PERC, 
        //     LAST_PRICE, 
        //     VOLUME, 
        //     HIGH, 
        //     LOW
        // ]
        return new Bluebird((resolve, reject) => {
            var pairs = BitfinexService.CurrencyPairsV2List;
            var symbols = "";
            for (var i = 0; i < pairs.length; i++) {
                symbols += pairs[i].name + ",";
            }
            symbols = symbols.substr(0, symbols.length - 1);
            var options = {} as https.RequestOptions;
            options.host = "api.bitfinex.com";
            options.path = "/v2/tickers?symbols=" + symbols;
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        var dataList = JSON.parse(output) as object[];
                        Bluebird.try(() => {
                            var index = 0;
                            var result = [] as ITickerHistoryModel[];
                            var service = new BitfinexService();
                            function processData() {
                                var data = dataList[index] as string[];
                                var currencyName = "";
                                for (var k = 0; k < pairs.length; k++) {
                                    if (pairs[k].name == data[0]) {
                                        currencyName = pairs[k].displayName;
                                        break;
                                    }
                                }
                                var priceModel = {} as IBitfinexPriceModel;
                                priceModel.currency = currencyName;
                                priceModel.bid = parseFloat(data[1]);
                                priceModel.ask = parseFloat(data[3]);
                                priceModel.dailyChange = parseFloat(data[5]);
                                priceModel.dailyChangePercent = parseFloat(data[6]);
                                priceModel.last_price = parseFloat(data[7]);
                                priceModel.high = parseFloat(data[9]);
                                priceModel.low = parseFloat(data[10]);
                                service.insertTickerHistory(priceModel).then((res) => {
                                    if (res) {
                                        result.push(res);
                                    }
                                    index++;
                                    if (index < dataList.length) {
                                        processData();
                                    } else {
                                        resolve(result as ITickerHistoryModel[]);
                                    }
                                });
                            }
                            processData();
                        }).catch((err) => {
                            reject(err);
                        });
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.end();
        });
    }
    private insertTickerHistory(data: IBitfinexPriceModel) {
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            Bluebird.try(() => {
                return Bluebird.resolve(this.convertToTickerHistoryModel(data));
            }).then((ticker) => {
                if (ticker.lastPrice) {
                    return ticker.save();
                } else {
                    return Bluebird.reject("data error");
                }
            }).then((res) => {
                resolve(res);
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        });
    }

    private convertToTickerHistoryModel(data: IBitfinexPriceModel) {
        var result = new TickerHistory;
        result.currency = data.currency;
        result.lastPrice = data.last_price;
        result.lowPrice = data.low;
        result.highPrice = data.high;
        result.dailyChange = data.dailyChange;
        result.dailyChangePercent = data.dailyChangePercent;
        return result;
    }
}