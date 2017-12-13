import * as Bluebird from "bluebird";
import { default as TickerHistory, ITickerHistoryModel } from "../models/db-models/ticker-history-model";

export class BaseService {
    public static DataEffectiveTime = 5000;
    public cleanDB() {
        return new Bluebird<ITickerHistoryModel>((resolve, reject) => {
            Bluebird.try(() => {
                var sortCondition = {
                    createdAt: 1
                };
                return TickerHistory.find({}).sort(sortCondition).then<ITickerHistoryModel[]>();
            }).then((res) => {
                if (res.length > 0) {
                    var now = new Date().getTime();
                    for (var i = 0; i < res.length - 3; i++) {
                        try {
                            if (res[i] && (now - res[i].createdAt.getTime()) > BaseService.DataEffectiveTime) {
                                TickerHistory.findById(res[i].id as string).then((row) => {
                                    if (row) {
                                        row.remove();
                                    }
                                });
                            }
                        } catch (e) { }
                    }
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
}