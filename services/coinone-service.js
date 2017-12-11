"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class CoinoneService {
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
                var effectiveTime = 3000;
                var now = new Date().getTime();
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < effectiveTime) {
                    console.log("");
                    console.log("Coinone [" + res[0].currency + " : " + res[0].lastPrice + "] ... read from db _ time diff : " + (now - res[0].createdAt.getTime()));
                    console.log("");
                    return Bluebird.resolve(res[0]);
                }
                else {
                    if (res.length > 0) {
                        try {
                            for (var i = 0; i < res.length - 3; i++) {
                                ticker_history_model_1.default.findById(res[i].id).then((res) => {
                                    if (res) {
                                        res.remove();
                                    }
                                });
                            }
                        }
                        catch (e) { }
                    }
                    return this.query(currencyName);
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
    query(currencyName) {
        //https://api.coinone.co.kr/ticker?currency=iota
        return new Bluebird((resolve, reject) => {
            var options = {};
            options.host = "api.coinone.co.kr";
            options.path = "/ticker?currency=" + currencyName.name;
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        var model = JSON.parse(output);
                        model.currency = currencyName.displayName;
                        Bluebird.try(() => {
                            return this.insertTickerHistory(model);
                        }).then((res) => {
                            resolve(res);
                        }).catch((err) => {
                            reject(err);
                        });
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
                return Bluebird.resolve(this.convertToTickerHistoryModel(data));
            }).then((ticker) => {
                if (ticker.lastPrice) {
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
        var result = new ticker_history_model_1.default;
        result.currency = data.currency;
        result.lastPrice = data.last;
        result.lowPrice = data.low;
        result.highPrice = data.high;
        return result;
    }
}
CoinoneService.CurrencyPairs = {
    "BTCKRW": { displayName: "BTCKRW", name: "BTC" },
    "IOTKRW": { displayName: "IOTKRW", name: "IOTA" }
};
exports.CoinoneService = CoinoneService;
//# sourceMappingURL=coinone-service.js.map