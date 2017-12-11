import * as Bluebird from "bluebird";
import * as https from "https";
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
    public getPrice(currencyName: ICurrencyPairNameModel) {
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            var findCondition = {
                currency: currencyName.displayName
            };
            var sortCondition = {
                createdAt: -1
            };
            Bluebird.try(() => {
                return TickerHistory.find(findCondition).sort(sortCondition).then<ITickerHistoryModel[]>();
            }).then<Bluebird<ITickerHistoryModel> | undefined>((res) => {
                var effectiveTime = 6500;
                var now = new Date().getTime();
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < effectiveTime) {
                    console.log("");
                    console.log("Bitfinex [" + res[0].currency + " : " + res[0].lastPrice + "] ... read from db _ time diff : " + (now - res[0].createdAt.getTime()));
                    console.log("");
                    return Bluebird.resolve(res[0]);
                } else {
                    return this.query(currencyName);
                }
            }).then((res) => {
                if (res) {
                    resolve(res);
                } else {
                    reject("can't find ticker history");
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
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
        return result;
    }
}