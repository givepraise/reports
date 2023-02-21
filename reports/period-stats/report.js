export default class Report {
  manifest = {
    name: "period-stats",
    displayName: "Period Stats",
    description: "Summarizes the period stats.",
    version: "0.0.1",
    author: "General Magic",
    publisher: "general-magic",
    license: "GPLv3",
    repository: "https://github.com/givepraise/praise-reports",
    bugs: "https://github.com/givepraise/praise-reports/issues",
    categories: ["Basic reports", "Praise receiver reports"],
    keywords: ["toplist"],
    configuration: {},
  };

  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

  run() {
    const { startDate, endDate } = this.config;

    const sql = `SELECT 
      count(praises) AS praise_count, 
      round(sum(praises.score), 2) AS score 
      FROM praises 
      WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'
    ;`;

    return this.db.query(sql);
  }
}
