"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const base_service_1 = require("./base-service");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class QueryService {
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
}
QueryService.CurrencyPairs = {
    "BTCUSD": { displayName: "BTCUSD", name: "tBTCUSD" },
    "IOTUSD": { displayName: "IOTUSD", name: "tIOTUSD" },
    "XMRUSD": { displayName: "XMRUSD", name: "tXMRUSD" },
    "ETHUSD": { displayName: "ETHUSD", name: "tETHUSD" },
    "LTCUSD": { displayName: "LTCUSD", name: "tLTCUSD" },
    "ZECUSD": { displayName: "ZECUSD", name: "tZECUSD" },
    "XRPUSD": { displayName: "XRPUSD", name: "tXRPUSD" },
    "DSHUSD": { displayName: "DSHUSD", name: "tDSHUSD" },
    "XLMBTC": { displayName: "XLMBTC", name: "XLMBTC" },
};
QueryService.CurrencyPairsList = [
    { displayName: "BTCUSD", name: "BTCUSD" },
    { displayName: "IOTUSD", name: "IOTUSD" },
    { displayName: "XMRUSD", name: "XMRUSD" },
    { displayName: "ETHUSD", name: "ETHUSD" },
    { displayName: "LTCUSD", name: "LTCUSD" },
    { displayName: "ZECUSD", name: "ZECUSD" },
    { displayName: "XRPUSD", name: "XRPUSD" },
    { displayName: "DASHUSD", name: "DASHUSD" },
    { displayName: "XLMBTC", name: "XLMBTC" },
];
exports.QueryService = QueryService;
//# sourceMappingURL=query-service.js.map