"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitfinex_service_1 = require("../services/bitfinex-service");
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    query() {
        var currencyName = this.req.query.currencyName;
        var service = new bitfinex_service_1.BitfinexService();
        service.getPrice(currencyName).then((data) => {
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