import * as Bluebird from "bluebird";
import { BaseService } from "./base-service";
import { BitfinexService } from "./bitfinex-service";
import { BittrexService } from "./bittrex-service";

interface ISchedule {
    intervalSec: number;
    fn: () => any;
    lastExecuteDate?: Date;
}

export class JobSchedulerService {
    private schedule: ISchedule[] = [
        {
            intervalSec: 5000000000,
            fn: new BitfinexService().queryAll
        },
        {
            intervalSec: 50000000000,
            fn: new BittrexService().queryAll
        },
        {
            intervalSec: 60000000000,
            fn: new BaseService().cleanDB
        }
    ];
    public start() {
        setInterval(() => { this.run(); }, 1000);
    }
    private run() {
        const currentDate = new Date();
        this.schedule.forEach((job) => {
            if (job) {
                if (job.lastExecuteDate) {
                    const tempCurrentDate = currentDate as any;
                    const tempLastExecuteDate = job.lastExecuteDate as any;
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
                } else {
                    job.lastExecuteDate = new Date();
                }
            }
        });
    }
}
