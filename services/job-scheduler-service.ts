import * as Bluebird from "bluebird";
import { BitfinexService } from "./bitfinex-service";

interface ISchedule {
    intervalSec: number;
    fn: () => any;
    lastExecuteDate?: Date;
}

export class JobSchedulerService {
    private schedule: ISchedule[] = [
        {
            intervalSec: 3,
            fn: new BitfinexService().queryAll
        },
        {
            intervalSec: 600,
            fn: new BitfinexService().cleanDB
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
