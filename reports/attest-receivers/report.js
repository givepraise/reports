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
        rac.name AS receiver_useraccounts_name, 
        ru.identityEthAddress AS receiver_users_identityEthAddress, 
        FLOOR(SUM(praises.score)) AS total_praise_score
      FROM praises
      LEFT JOIN useraccounts AS rac ON praises.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      ${where}
      GROUP BY rac.name, ru.identityEthAddress
      ORDER BY total_praise_score DESC
    ;`;

    const rows = await this.db.query(sql);

    const rankedRows = rows.map((row, index) => ({
      ...row,
      top_10_receiver: index < 10,
      top_50_receiver: index < 50,
      top_100_receiver: index < 100,
    }));

    return this.finish(rankedRows);
  }
}
