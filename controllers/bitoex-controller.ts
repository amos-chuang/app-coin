import * as Bluebird from "bluebird";
import * as Express from "express";
import { BitoexService } from "../services/bitoex-service";

export class Controller {
    private req: Express.Request;
    private res: Express.Response;
    constructor(req: Express.Request, res: Express.Response) {
        this.req = req;
        this.res = res;
    }
    public query() {
        var service = new BitoexService();
        service.getPrice().then((data) => {
            this.res.json(data);
        }).catch((err) => {
            console.log(err);
            this.res.statusCode = 500;
            this.res.json({
                msg: new String(err)
            });
        })
    }
}
