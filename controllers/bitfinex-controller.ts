import * as Bluebird from "bluebird";
import * as Express from "express";
import { BitfinexService } from "../services/bitfinex-service";

export class Controller {
    private req: Express.Request;
    private res: Express.Response;
    constructor(req: Express.Request, res: Express.Response) {
        this.req = req;
        this.res = res;
    }
    public query() {
        var currencyName = this.req.query.currencyName as string;
        var service = new BitfinexService();
        service.getPrice(currencyName).then((data) => {
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
