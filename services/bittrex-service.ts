import * as Bluebird from "bluebird";
import * as https from "https";
import { BaseService } from "./base-service";
import { IBittrexPriceModel } from "../models/view-models/bittrex-price-model";
import { IBittrexPriceDetailModel } from "../models/view-models/bittrex-price-detail-model";
import { default as TickerHistory, ITickerHistoryModel } from "../models/db-models/ticker-history-model";
import { ICurrencyPairNameModel } from "../models/view-models/currency-pair-name-model";

export class BittrexService {
    public static CurrencyPairs: { [name: string]: ICurrencyPairNameModel } = {
        "XLMBTC": { displayName: "XLMBTC", name: "BTC-XLM" },
    };
    public static CurrencyPairsList: ICurrencyPairNameModel[] = [
        { displayName: "XLMBTC", name: "BTC-XLM" },
    ];
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
            }).then((res) => {
                var now = new Date().getTime();
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < BaseService.DataEffectiveTime) {
                    console.log("");
                    console.log("Bittrex [" + res[0].currency + " : " + res[0].lastPrice + "] ... read from db _ time diff : " + (now - res[0].createdAt.getTime()));
                    console.log("");
                    return Bluebird.resolve(res[0]);
                } else {
                    return Bluebird.reject("waiting for data cache");
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
    public queryAll() {
        // https://bittrex.com/api/v1.1/public/getmarketsummaries
        return new Bluebird((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = "bittrex.com";
            options.path = "/api/v1.1/public/getmarketsummaries";
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        var queryRes = JSON.parse(output) as IBittrexPriceModel;
                        if (queryRes && queryRes.result && queryRes.result.length > 0) {
                            var dataList = queryRes.result;
                            Bluebird.try(() => {
                                var index = 0;
                                var result = [] as ITickerHistoryModel[];
                                var service = new BittrexService();
                                function processData() {
                                    var data = dataList[index];
                                    Bluebird.try(() => {
                                        return service.insertTickerHistory(data);
                                    }).then((res) => {
                                        console.log("Bittrex :");
                                        if (res) {
                                            console.log(res);
                                            result.push(res);
                                        }
                                    }).catch((e) => {
                                        /*console.log("===");
                                        console.log(e);
                                        console.log(data);
                                        console.log("===");*/
                                    }).finally(() => {
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
                        } else {
                            reject("api response error");
                        }
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
    private insertTickerHistory(data: IBittrexPriceDetailModel) {
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            Bluebird.try(() => {
                var ticker = this.convertToTickerHistoryModel(data);
                if (ticker) {
                    return Bluebird.resolve(ticker);
                } else {
                    return Bluebird.reject("convert error");
                }
            }).then((ticker) => {
                if (ticker && ticker.lastPrice) {
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
    private convertToTickerHistoryModel(data: IBittrexPriceDetailModel) {
        var currencyName = "";
        for (var k = 0; k < BittrexService.CurrencyPairsList.length; k++) {
            if (BittrexService.CurrencyPairsList[k].name == data.MarketName) {
                currencyName = BittrexService.CurrencyPairsList[k].displayName;
                break;
            }
        }
        var result = null;
        if (currencyName.length > 0) {
            result = new TickerHistory;
            result.currency = currencyName;
            result.lastPrice = data.Last;
            result.lowPrice = data.Low;
            result.highPrice = data.High;
            result.dailyChange = data.Last - data.PrevDay;
            result.dailyChangePercent = 0;
            result.prevDayLastPrice = data.PrevDay;
        }
        return result;
    }
}