import DistStraightCurveWithCeiling from "../dist-straight-curve-with-ceiling";
import Manifest from "./manifest.json";

export default class Report extends DistStraightCurveWithCeiling {
  manifest = Manifest;

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
