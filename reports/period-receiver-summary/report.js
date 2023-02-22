import BaseReport from "../base-report";

export default class Report extends BaseReport {
  manifest = {
    name: "period-receiver-summary",
    displayName: "Period Summary",
    description:
      "Summarizes period praise receivers, scores and number of praise.",
    version: "0.0.1",
    author: "Praise",
    publisher: "praise",
    license: "GPL-3.0",
    repository: "https://github.com/givepraise/praise-reports",
    bugs: "https://github.com/givepraise/praise-reports/issues",
    categories: ["Basic reports", "Period reports"],
    keywords: ["praise", "period", "score", "summary"],
    configuration: {},
  };

  async run() {
    const { startDate, endDate } = this.config;

    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : "";

    let sql = `SELECT 
      useraccounts.name,
      ANY_VALUE(users.username) as username, 
      ANY_VALUE(users.identityEthAddress) as identity_eth_address, 
      ANY_VALUE(users.rewardsEthAddress) as rewards_eth_address, 
      count(praises) AS praise_count, 
      round(sum(praises.score), 2) AS score 
      FROM praises 
      LEFT JOIN useraccounts ON praises.receiver = useraccounts._id
      LEFT JOIN users ON useraccounts.user = users._id
      ${where}
      GROUP BY useraccounts.name
      ORDER BY score DESC
    ;`;

    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
