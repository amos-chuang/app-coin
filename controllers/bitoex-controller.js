"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bitoex_service_1 = require("../services/bitoex-service");
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    query() {
        var service = new bitoex_service_1.BitoexService();
        service.getPrice().then((data) => {
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
//# sourceMappingURL=bitoex-controller.js.map