"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const timers_1 = require("timers");
class RobotService {
    constructor() {
        this.currencyCache = {};
    }
    start() {
        this.timer = timers_1.setInterval(() => {
        }, 3000);
    }
    stop() {
        timers_1.clearTimeout(this.timer);
    }
    updateCurrency() {
        return new Bluebird(() => {
        });
    }
}
exports.RobotService = RobotService;
//# sourceMappingURL=robot-service.js.map