import { IBittrexPriceDetailModel } from "./bittrex-price-detail-model";

export interface IBittrexPriceModel {
    success: boolean;
    message: string;
    result: IBittrexPriceDetailModel[];
}