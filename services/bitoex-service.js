"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const https = require("https");
const phantom = require("phantom");
class BitoexService {
    getPriceByPhantom() {
        return new Bluebird((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const instance = yield phantom.create();
            const page = yield instance.createPage();
            const url = "https://www.bitoex.com/sync/dashboard_fixed/" + new Date().getTime();
            const status = yield page.open(url);
            const content = JSON.stringify(yield page.property('content'));
            const matches = /<pre.*>(.*)<\/pre>/.exec(content);
            let data = null;
            if (matches != null) {
                data = matches[1];
                data = data.replace(/\\/g, "");
                console.log("");
                console.log("bitoex");
                console.log(data);
                console.log("");
            }
            instance.exit();
            let result = {};
            if (data != null) {
                var obj = JSON.parse(data);
                var model = {};
                model.buyPrice = parseInt(obj[0].replace(/,/g, ""));
                model.sellPrice = parseInt(obj[1].replace(/,/g, ""));
                result = model;
            }
            resolve(result);
        }));
    }
    getPrice() {
        return new Bluebird((resolve, reject) => {
            var options = {};
            // options.host = "proxy.hine.net";
            // options.port = 80;
            // options.path = "https://www.bitoex.com/sync/dashboard_fixed/" + new Date().getTime();
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
                        console.log("");
                        console.log("bitoex");
                        console.log(output);
                        console.log("");
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
}
exports.BitoexService = BitoexService;
//# sourceMappingURL=bitoex-service.js.map