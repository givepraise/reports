import BaseReport from "../base-report";
import Manifest from "./manifest.json";
export default class Report extends BaseReport {
  manifest = Manifest;

  async run() {
    const { startDate, endDate } = this.config;

    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : "";

    let sql = `SELECT 
        gac.name AS giver_useraccounts_name, 
        gu.identityEthAddress AS giver_users_identityEthAddress, 
        FLOOR(SUM(praises.score)) AS total_praise_score
      FROM praises
      LEFT JOIN useraccounts AS gac ON praises.giver = gac._id
      LEFT JOIN users AS gu ON gac.user = gu._id
      ${where}
      GROUP BY gac.name, gu.identityEthAddress
      ORDER BY total_praise_score DESC
    ;`;

    const rows = await this.db.query(sql);

    const rankedRows = rows.map((row, index) => ({
      ...row,
      top_10_giver: index < 10,
      top_50_giver: index < 50,
      top_100_giver: index < 100,
    }));

    return this.finish(rankedRows);
  }
}
