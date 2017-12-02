//https://api.bitfinex.com/v1/pubticker/IOTUSD
import * as Bluebird from "bluebird";
import * as https from "https";
import { IBitfinexPriceModel } from "../models/view-models/bitfinex-price-model";

export class BitfinexService {
    public getPrice(currencyName: string) {
        return new Bluebird<IBitfinexPriceModel>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = "api.bitfinex.com";
            options.path = "/v1/pubticker/" + currencyName;
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
                        resolve(model);
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
}