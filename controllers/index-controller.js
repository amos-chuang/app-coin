"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Controller {
    constructor(req, res) {
        this.req = req;
        this.res = res;
    }
    index() {
        this.res.render("index", { title: "IndexController" });
    }
}
exports.Controller = Controller;
//# sourceMappingURL=index-controller.js.map