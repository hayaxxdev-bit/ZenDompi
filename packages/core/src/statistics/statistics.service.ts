import {
  getMonthlyStats as dbGetMonthlyStats,
  getYearlyStats as dbGetYearlyStats,
  getCashflow as dbGetCashflow,
} from "@zendompi/database";

export class StatisticsService {
  async getMonthly(userId: string, year: number, month: number) {
    return dbGetMonthlyStats({ userId, year, month });
  }

  async getYearly(userId: string, year: number) {
    return dbGetYearlyStats({ userId, year });
  }

  async getCashflow(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: "day" | "week" | "month" = "day"
  ) {
    return dbGetCashflow({ userId, startDate, endDate, groupBy });
  }
}

export const statisticsService = new StatisticsService();