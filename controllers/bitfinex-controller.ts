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
}
