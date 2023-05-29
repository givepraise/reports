import DistStraightCurveWithCeiling from "../dist-straight-curve-with-ceiling";
import Manifest from "./manifest.json";

export default class Report extends DistStraightCurveWithCeiling {
  manifest = Manifest;

  async run() {
    let rows = await super.run();

    if (Array.isArray(rows) && rows.length > 0) {
      const { totalScore, periodBudget } = super.distributionStats(rows);

      const praiseDistribution = rows.map((receiver) => ({
        receiver: receiver.rewards_eth_address,
        amount: (receiver.score / totalScore) * periodBudget,
      }));

      return this.finish(praiseDistribution);
    }
    return this.finish([]);
  }
}
