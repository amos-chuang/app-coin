"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const ticker_history_model_1 = require("../models/db-models/ticker-history-model");
class BaseService {
    cleanDB() {
        return new Bluebird((resolve, reject) => {
            Bluebird.try(() => {
                var sortCondition = {
                    createdAt: 1
                };
                return ticker_history_model_1.default.find({}).sort(sortCondition).then();
            }).then((res) => {
                if (res.length > 0) {
                    var now = new Date().getTime();
                    for (var i = 0; i < res.length - 3; i++) {
                        try {
                            if (res[i] && (now - res[i].createdAt.getTime()) > BaseService.DataEffectiveTime) {
                                ticker_history_model_1.default.findById(res[i].id).then((row) => {
                                    if (row) {
                                        row.remove();
                                    }
                                });
                            }
                        }
                        catch (e) { }
                    }
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
}
BaseService.DataEffectiveTime = 5000;
exports.BaseService = BaseService;
//# sourceMappingURL=base-service.js.map