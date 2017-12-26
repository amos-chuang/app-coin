"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const query_service_1 = require("../services/query-service");
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    ticker() {
        var currencyName = this.req.query.currencyName;
        var target = query_service_1.QueryService.CurrencyPairs[currencyName];
        var service = new query_service_1.QueryService();
        Bluebird.try(() => {
            return service.getPrice(target);
        }).then((data) => {
            this.res.header("Access-Control-Allow-Origin", '*');
            this.res.header("Access-Control-Allow-Credentials", 'true');
            this.res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            this.res.json(data);
        }).catch((err) => {
            this.res.statusCode = 400;
            this.res.json({
                msg: new String(err)
            });
        });
    }
}
exports.Controller = Controller;
//# sourceMappingURL=query-controller.js.map