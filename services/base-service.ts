import * as Bluebird from "bluebird";
import * as https from "https";
import { default as TickerHistory, ITickerHistoryModel } from "../models/db-models/ticker-history-model";

export class BaseService {
    public static DataEffectiveTime = 12000;
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
    public httpGet(host: string, path: string) {
        return new Bluebird<string>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = host;
            options.path = path;
            options.method = "GET";
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    resolve(output);
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.end();
        });
    }
    public httpPostJson(host: string, path: string, data: string) {
        return new Bluebird<string>((resolve, reject) => {
            var options = {} as https.RequestOptions;
            options.host = host;
            options.path = path;
            options.method = "POST";
            options.headers = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            };
            var output = "";
            var req = https.request(options, (res) => {
                res.setEncoding("utf8");
                res.on("data", (chunk) => {
                    output += chunk;
                });
                res.on("end", () => {
                    resolve(output);
                });
            });
            req.on("error", (err) => {
                reject(err);
            });
            req.write(data);
            req.end();
        });
    }
}