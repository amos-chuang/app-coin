"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
class BitoexService {
    getPrice() {
        return new Bluebird((resolve, reject) => {
            var options = {};
            options.host = "www.bitoex.com";
            options.path = "/sync/dashboard_fixed/" + new Date().getTime();
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        var obj = JSON.parse(output);
                        var model = {};
                        model.buyPrice = parseInt(obj[0].replace(",", ""));
                        model.sellPrice = parseInt(obj[1].replace(",", ""));
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
    getPriceTest1() {
        return new Bluebird((resolve, reject) => {
            var options = {};
            options.host = "www.bitoex.com";
            options.path = "/sync/dashboard_fixed/" + new Date().getTime();
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    try {
                        /*var obj = JSON.parse(output) as string[];
                        var model = {} as IBitoexPriceModel;
                        model.buyPrice = parseInt(obj[0].replace(",", ""));
                        model.sellPrice = parseInt(obj[1].replace(",", ""));
                        resolve(model);*/
                        resolve(output);
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
exports.BitoexService = BitoexService;
//# sourceMappingURL=bitoex-service.js.map