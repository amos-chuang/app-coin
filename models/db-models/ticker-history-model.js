"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const tickerHistorySchema = new mongoose.Schema({
    currency: String,
    lastPrice: Number,
    lowPrice: Number,
    highPrice: Number,
    dailyChange: Number,
    dailyChangePercent: Number,
}, { timestamps: true });
const TickerHistory = mongoose.model("TickerHistory", tickerHistorySchema);
exports.default = TickerHistory;
//# sourceMappingURL=ticker-history-model.js.map