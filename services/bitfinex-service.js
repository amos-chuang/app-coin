"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class BitfinexService {
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
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < BitfinexService.DataEffectiveTime) {
                    console.log("");
                    console.log("Bitfinex [" + res[0].currency + " : " + res[0].lastPrice + "] ... read from db _ time diff : " + (now - res[0].createdAt.getTime()));
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
    query(currencyName) {
        //https://api.bitfinex.com/v1/pubticker/IOTUSD
        return new Bluebird((resolve, reject) => {
            var options = {};
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
    queryAll() {
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
            var options = {};
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
                        var dataList = JSON.parse(output);
                        Bluebird.try(() => {
                            var index = 0;
                            var result = [];
                            function processData() {
                                var data = dataList[index];
                                var currencyName = "";
                                for (var k = 0; k < pairs.length; k++) {
                                    if (pairs[k].name == data[0]) {
                                        currencyName = pairs[k].displayName;
                                        break;
                                    }
                                }
                                var priceModel = {};
                                priceModel.currency = currencyName;
                                priceModel.bid = parseFloat(data[1]);
                                priceModel.ask = parseFloat(data[3]);
                                priceModel.last_price = parseFloat(data[7]);
                                priceModel.high = parseFloat(data[9]);
                                priceModel.low = parseFloat(data[10]);
                                var service = new BitfinexService();
                                service.insertTickerHistory(priceModel).then((res) => {
                                    if (res) {
                                        result.push(res);
                                    }
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
    cleanDB() {
        return new Bluebird((resolve, reject) => {
            Bluebird.try(() => {
                var sortCondition = {
                    createdAt: 1
                };
                return ticker_history_model_1.default.find({}).sort(sortCondition).then();
            }).then((res) => {
                if (res.length > 0) {
                    var now = new Date().getTime();
                    for (var i = 0; i < res.length - 3; i++) {
                        try {
                            if (res[i] && (now - res[i].createdAt.getTime()) > BitfinexService.DataEffectiveTime) {
                                ticker_history_model_1.default.findById(res[i].id).then((row) => {
                                    if (row) {
                                        row.remove();
                                    }
                                });
                            }
                        }
                        catch (e) { }
                    }
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
    convertToTickerHistoryModel(data) {
        var result = new ticker_history_model_1.default;
        result.currency = data.currency;
        result.lastPrice = data.last_price;
        result.lowPrice = data.low;
        result.highPrice = data.high;
        return result;
    }
}
BitfinexService.DataEffectiveTime = 5000;
BitfinexService.CurrencyPairs = {
    "BTCUSD": { displayName: "BTCUSD", name: "BTCUSD" },
    "IOTUSD": { displayName: "IOTUSD", name: "IOTUSD" },
    "XMRUSD": { displayName: "XMRUSD", name: "XMRUSD" },
    "ETHUSD": { displayName: "ETHUSD", name: "ETHUSD" },
    "LTCUSD": { displayName: "LTCUSD", name: "LTCUSD" },
    "ZECUSD": { displayName: "ZECUSD", name: "ZECUSD" }
};
BitfinexService.CurrencyPairsV2 = {
    "BTCUSD": { displayName: "BTCUSD", name: "tBTCUSD" },
    "IOTUSD": { displayName: "IOTUSD", name: "tIOTUSD" },
    "XMRUSD": { displayName: "XMRUSD", name: "tXMRUSD" },
    "ETHUSD": { displayName: "ETHUSD", name: "tETHUSD" },
    "LTCUSD": { displayName: "LTCUSD", name: "tLTCUSD" },
    "ZECUSD": { displayName: "ZECUSD", name: "tZECUSD" }
};
BitfinexService.CurrencyPairsV2List = [
    { displayName: "BTCUSD", name: "tBTCUSD" },
    { displayName: "IOTUSD", name: "tIOTUSD" },
    { displayName: "XMRUSD", name: "tXMRUSD" },
    { displayName: "ETHUSD", name: "tETHUSD" },
    { displayName: "LTCUSD", name: "tLTCUSD" },
    { displayName: "ZECUSD", name: "tZECUSD" }
];
exports.BitfinexService = BitfinexService;
//# sourceMappingURL=bitfinex-service.js.map