"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Bluebird = require("bluebird");
const base_service_1 = require("./base-service");
const bitfinex_service_1 = require("./bitfinex-service");
const bittrex_service_1 = require("./bittrex-service");
class JobSchedulerService {
    constructor() {
        this.schedule = [
            {
                intervalSec: 5,
                fn: new bitfinex_service_1.BitfinexService().queryAll
            },
            {
                intervalSec: 5,
                fn: new bittrex_service_1.BittrexService().queryAll
            },
            {
                intervalSec: 600,
                fn: new base_service_1.BaseService().cleanDB
            }
        ];
    }
    start() {
        setInterval(() => { this.run(); }, 1000);
    }
    run() {
        const currentDate = new Date();
        this.schedule.forEach((job) => {
            if (job) {
                if (job.lastExecuteDate) {
                    const tempCurrentDate = currentDate;
                    const tempLastExecuteDate = job.lastExecuteDate;
                    const diffSec = (tempCurrentDate - tempLastExecuteDate) / 1000;
                    if (diffSec > job.intervalSec) {
                        console.log("[JOB] fn : " + job.fn.name + " DiffSec : " + diffSec + " LastExecuteDate : " + job.lastExecuteDate + " Now : " + new Date());
                        job.lastExecuteDate = new Date();
                        Bluebird.try(() => {
                            job.fn();
                        }).catch((err) => {
                            console.log("job error : " + err);
                        });
                    }
                }
                else {
                    job.lastExecuteDate = new Date();
                }
            }
        });
    }
}
exports.JobSchedulerService = JobSchedulerService;
//# sourceMappingURL=job-scheduler-service.js.map