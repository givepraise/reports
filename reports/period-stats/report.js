import BaseReport from "../base-report";
import Manifest from "./manifest.json";

export default class Report extends BaseReport {
  manifest = Manifest;

  async run() {
    const { startDate, endDate } = this.config;

    const sql = `SELECT 
      count(praises) AS praise_count, 
      round(sum(praises.score), 2) AS score 
      FROM praises 
      WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'
    ;`;

    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
