import * as Bluebird from "bluebird";
import { setInterval, clearTimeout } from "timers";
import { default as TickerHistory,ITickerHistoryModel} from "../models/db-models/ticker-history-model";

export class RobotService {
    private timer: NodeJS.Timer;
    private currencyCache = {};
    public start() {
        this.timer = setInterval(() => { 

        }, 3000);
    }
    public stop() {
        clearTimeout(this.timer);
    }
    public updateCurrency() {
        return new Bluebird(() => { 
            
        });
    }
}