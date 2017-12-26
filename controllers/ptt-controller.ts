import * as Bluebird from "bluebird";
import * as Express from "express";
import { PttService } from "../services/ptt-service";

export class Controller {
    private req: Express.Request;
    private res: Express.Response;
    constructor(req: Express.Request, res: Express.Response) {
        this.req = req;
        this.res = res;
    }
    public getArticleList() {
        new PttService().getArticleList().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
    public getDailyDiscussion() {
        new PttService().getDailyDiscussion().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
    public getDailyDiscussionSweetgold() {
        new PttService().getDailyDiscussionSweetgold().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
}