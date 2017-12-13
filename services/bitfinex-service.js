"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class BitfinexService {
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
                            var service = new BitfinexService();
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
    convertToTickerHistoryModel(data) {
        var result = new ticker_history_model_1.default;
        result.currency = data.currency;
        result.lastPrice = data.last_price;
        result.lowPrice = data.low;
        result.highPrice = data.high;
        result.dailyChange = data.dailyChange;
        result.dailyChangePercent = data.dailyChangePercent;
        return result;
    }
}
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
    "ZECUSD": { displayName: "ZECUSD", name: "tZECUSD" },
    "XRPUSD": { displayName: "XRPUSD", name: "tXRPUSD" },
    "DSHUSD": { displayName: "DSHUSD", name: "tDSHUSD" },
};
BitfinexService.CurrencyPairsV2List = [
    { displayName: "BTCUSD", name: "tBTCUSD" },
    { displayName: "IOTUSD", name: "tIOTUSD" },
    { displayName: "XMRUSD", name: "tXMRUSD" },
    { displayName: "ETHUSD", name: "tETHUSD" },
    { displayName: "LTCUSD", name: "tLTCUSD" },
    { displayName: "ZECUSD", name: "tZECUSD" },
    { displayName: "XRPUSD", name: "tXRPUSD" },
    { displayName: "DSHUSD", name: "tDSHUSD" },
];
exports.BitfinexService = BitfinexService;
//# sourceMappingURL=bitfinex-service.js.map