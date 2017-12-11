import * as Bluebird from "bluebird";
import * as Express from "express";
import { CoinoneService } from "../services/coinone-service";
import { config } from "bluebird";

export class Controller {
    private req: Express.Request;
    private res: Express.Response;
    constructor(req: Express.Request, res: Express.Response) {
        this.req = req;
        this.res = res;
    }
    public query() {
        var currencyName = this.req.query.currencyName as string;
        var target = CoinoneService.CurrencyPairs[currencyName];
        var service = new CoinoneService();
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
        })
    }
}
