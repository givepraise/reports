import DistReport from "./dist-report";

export default class Report extends DistReport {
  manifest = {
    name: "dist-straight-curve-with-ceiling",
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

  constructor(config, db) {
    super(config, db);
    if (!config.tokenType || !config.tokenAddress) {
      throw new Error(
        "Missing tokenType or tokenAddress in config. Please check your config."
      );
    }
  }

  async run() {
    const { tokenType, tokenAddress } = this.config;

    let rows = await super.run();

    if (Array.isArray(rows) && rows.length > 0) {
      const { totalScore, periodBudget } = super.distributionStats(rows);

      const praiseDistribution = rows.map((receiver) => ({
        token_type: tokenType,
        token_address: tokenAddress,
        receiver: receiver.rewards_eth_address,
        amount: (receiver.score / totalScore) * periodBudget,
        id: "",
      }));

      return this.finish(praiseDistribution);
    }
    return this.finish([]);
  }
}
