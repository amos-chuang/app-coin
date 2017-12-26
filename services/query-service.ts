import * as Bluebird from "bluebird";
import * as https from "https";
import { BaseService } from "./base-service";
import { default as TickerHistory, ITickerHistoryModel } from "../models/db-models/ticker-history-model";
import { ICurrencyPairNameModel } from "../models/view-models/currency-pair-name-model";

export class QueryService {
    public static CurrencyPairs: { [name: string]: ICurrencyPairNameModel } = {
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
    public static CurrencyPairsList: ICurrencyPairNameModel[] = [
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
    public getPrice(currencyName: ICurrencyPairNameModel) {
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            var findCondition = {
                currency: currencyName.displayName
            };
            var sortCondition = {
                createdAt: -1
            };
            Bluebird.try(() => {
                if (global.isDbConnected) {
                    return TickerHistory.find(findCondition).sort(sortCondition).then<ITickerHistoryModel[]>();
                } else {
                    return Bluebird.reject("db connect error");
                }
            }).then((res) => {
                var now = new Date().getTime();
                if (res.length > 0 && (now - res[0].createdAt.getTime()) < BaseService.DataEffectiveTime) {
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
}