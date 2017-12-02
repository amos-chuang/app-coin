"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//https://api.bitfinex.com/v1/pubticker/IOTUSD
const Bluebird = require("bluebird");
const https = require("https");
class BitfinexService {
    getPrice(currencyName) {
        return new Bluebird((resolve, reject) => {
            var options = {};
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
                        var model = JSON.parse(output);
                        resolve(model);
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
}
exports.BitfinexService = BitfinexService;
//# sourceMappingURL=bitfinex-service.js.map