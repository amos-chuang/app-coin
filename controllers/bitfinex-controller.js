"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const bitfinex_service_1 = require("../services/bitfinex-service");
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    query() {
        var currencyName = this.req.query.currencyName;
        var target = bitfinex_service_1.BitfinexService.CurrencyPairs[currencyName];
        var service = new bitfinex_service_1.BitfinexService();
        Bluebird.try(() => {
            return service.getPrice(target);
        }).then((data) => {
            this.res.header("Access-Control-Allow-Origin", '*');
            this.res.header("Access-Control-Allow-Credentials", 'true');
            this.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            this.res.json(data);
        }).catch((err) => {
            this.res.statusCode = 500;
            this.res.json({
                msg: new String(err)
            });
        });
    }
}
exports.Controller = Controller;
//# sourceMappingURL=bitfinex-controller.js.map