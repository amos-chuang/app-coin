"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
const base_service_1 = require("./base-service");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class BittrexService {
    getPrice(currencyName) {
        return new Bluebird((resolve, reject) => {
            var findCondition = {
                currency: currencyName.displayName
            };
            var sortCondition = {
                createdAt: -1
            };
            Bluebird.try(() => {
                return ticker_history_model_1.default.find(findCondition).sort(sortCondition).then();
            }).then((res) => {
                var now = new Date().getTime();
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < base_service_1.BaseService.DataEffectiveTime) {
                    console.log("");
                    console.log("Bittrex [" + res[0].currency + " : " + res[0].lastPrice + "] ... read from db _ time diff : " + (now - res[0].createdAt.getTime()));
                    console.log("");
                    return Bluebird.resolve(res[0]);
                }
                else {
                    return Bluebird.reject("waiting for data cache");
                }
            }).then((res) => {
                if (res) {
                    resolve(res);
                }
                else {
                    reject("can't find ticker history");
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
    queryAll() {
        // https://bittrex.com/api/v1.1/public/getmarketsummaries
        return new Bluebird((resolve, reject) => {
            var options = {};
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
                        var queryRes = JSON.parse(output);
                        if (queryRes && queryRes.result && queryRes.result.length > 0) {
                            var dataList = queryRes.result;
                            Bluebird.try(() => {
                                var index = 0;
                                var result = [];
                                var service = new BittrexService();
                                function processData() {
                                    var data = dataList[index];
                                    Bluebird.try(() => {
                                        return service.insertTickerHistory(data);
                                    }).then((res) => {
                                        if (res) {
                                            result.push(res);
                                        }
                                    }).finally(() => {
                                        index++;
                                        if (index < dataList.length) {
                                            processData();
                                        }
                                        else {
                                            resolve(result);
                                        }
                                    });
                                }
                                processData();
                            }).catch((err) => {
                                reject(err);
                            });
                        }
                        else {
                            reject("api response error");
                        }
                    }
                    catch (e) {
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
    insertTickerHistory(data) {
        return new Bluebird((resolve, reject) => {
            Bluebird.try(() => {
                var ticker = this.convertToTickerHistoryModel(data);
                if (ticker) {
                    return Bluebird.resolve(ticker);
                }
                else {
                    return Bluebird.reject("convert error");
                }
            }).then((ticker) => {
                if (ticker && ticker.lastPrice) {
                    return ticker.save();
                }
                else {
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
    convertToTickerHistoryModel(data) {
        var currencyName = "";
        for (var k = 0; k < BittrexService.CurrencyPairsList.length; k++) {
            if (BittrexService.CurrencyPairsList[k].name == data.MarketName) {
                currencyName = BittrexService.CurrencyPairsList[k].displayName;
                break;
            }
        }
        var result = null;
        if (currencyName.length > 0) {
            result = new ticker_history_model_1.default;
            result.currency = currencyName;
            result.lastPrice = data.Last;
            result.lowPrice = data.Low;
            result.highPrice = data.High;
            result.dailyChange = data.Last - data.PrevDay;
            result.dailyChangePercent = Math.round((1 - (data.Last / data.PrevDay)) * 1000) / 1000;
        }
        return result;
    }
}
BittrexService.CurrencyPairs = {
    "XLMBTC": { displayName: "XLMBTC", name: "BTC-XLM" },
};
BittrexService.CurrencyPairsList = [
    { displayName: "XLMBTC", name: "BTC-XLM" },
];
exports.BittrexService = BittrexService;
//# sourceMappingURL=bittrex-service.js.map