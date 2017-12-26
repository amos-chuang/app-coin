"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ptt_service_1 = require("../services/ptt-service");
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    getArticleList() {
        new ptt_service_1.PttService().getArticleList().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
    getDailyDiscussion() {
        new ptt_service_1.PttService().getDailyDiscussion().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
    getDailyDiscussionSweetgold() {
        new ptt_service_1.PttService().getDailyDiscussionSweetgold().then((data) => {
            this.res.json(data);
        }).catch((e) => {
            this.res.statusCode = 400;
            this.res.json(e);
        });
    }
}
exports.Controller = Controller;
//# sourceMappingURL=ptt-controller.js.map