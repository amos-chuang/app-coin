import * as mongoose from "mongoose";

export interface ITickerHistoryModel extends mongoose.Document {
    currency: string;
    lastPrice: number;
    lowPrice: number;
    highPrice: number;
    dailyChange: number;
    dailyChangePercent: number;
    createdAt: Date;
}

const tickerHistorySchema = new mongoose.Schema({
    currency: String,
    lastPrice: Number,
    lowPrice: Number,
    highPrice: Number,
    dailyChange: Number,
    dailyChangePercent: Number,
}, { timestamps: true });

const TickerHistory = mongoose.model<ITickerHistoryModel>("TickerHistory", tickerHistorySchema);
export default TickerHistory;
