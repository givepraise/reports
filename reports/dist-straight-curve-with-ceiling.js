import BaseReport from "./base-report";
export default class DistStraightCurveWithCeiling extends BaseReport {
  /**
   * Validate that any required config parameters are present.
   */
  constructor(config, db) {
    super(config, db);
    config.cutoff = parseFloat(config.cutoff);
    config.ceiling = parseFloat(config.ceiling);
    if (isNaN(config.cutoff) || isNaN(config.ceiling)) {
      throw new Error(
        "Missing/invalid cutoff or ceiling in config. Please provide both."
      );
    }
  }

  /**
   * The manifest is used to describe the report to the user. It is used by
   * the Praise dashboard to display the report settings and to generate
   * the report.
   */
  manifest() {
    return this.manifest;
  }

  /**
   * Filter out rows with no rewardsEthAddress as they are not eligible for rewards
   */
  filterNoRewardsAddress(rows) {
    const noRewards = rows.filter((row) => !row.rewards_eth_address);
    if (Array.isArray(noRewards) && noRewards.length > 0) {
      this.log(
        `\nFiltering ${noRewards.length} rows with no rewardsEthAddress:`
      );
      this.log(`\nuseraccount, score`);
      noRewards.forEach((row) => {
        this.log(`${row.useraccount_name}, ${row.score}`);
      });
    }
    return rows.filter((row) => row.rewards_eth_address);
  }

  /**
   * Filter out rows in filterReceivers. These are receivers that are not eligible by
   * decision of the community. For example, the community might decide that paid
   * employees are not eligible for rewards.
   */
  filterReceivers(rows) {
    const { filterReceivers } = this.config;
    if (Array.isArray(filterReceivers) && filterReceivers.length > 0) {
      this.log(
        `\nFiltering ${filterReceivers.length} receivers based on setting "filterReceivers":`
      );
      this.log(`\nuseraccount, score`);
      filterReceivers.forEach((filterReceiver) => {
        this.log(
          `${
            rows.find((row) => row.identity_eth_address === filterReceiver)
              .useraccount_name
          }, ${
            rows.find((row) => row.identity_eth_address === filterReceiver)
              .score
          } `
        );
      });

      return rows.filter(
        (row) => !filterReceivers.includes(row.identity_eth_address)
      );
    }
    return rows;
  }

  /**
   * Calculate total number of praises, total score, and period budget
   */
  distributionStats(rows) {
    const { cutoff, ceiling } = this.config;
    const totalNumberOfPraises = rows.reduce(
      (acc, row) => acc + row.praise_count,
      0
    );

    const totalScore = rows.reduce((acc, row) => acc + row.score, 0).toFixed(2);

    const periodBudget =
      totalNumberOfPraises > cutoff
        ? ceiling
        : (totalNumberOfPraises / cutoff) * ceiling;

    return { totalNumberOfPraises, totalScore, periodBudget };
  }

  /**
   * Query database for period praise receivers, scores and number of praise.
   * Filter out rows with no rewardsEthAddress and rows in filterReceivers.
   */
  async run() {
    const { startDate, endDate, devSupportPercentage } = this.config;
    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : "";

    let sql = `SELECT 
      useraccounts.name as useraccount_name,
      ANY_VALUE(users.username) as username, 
      ANY_VALUE(users.identityEthAddress) as identity_eth_address, 
      ANY_VALUE(users.rewardsEthAddress) as rewards_eth_address, 
      CAST(count(praises) AS INTEGER) AS praise_count,
      round(sum(praises.score), 2) AS score 
      FROM praises 
      LEFT JOIN useraccounts ON praises.receiver = useraccounts._id
      LEFT JOIN users ON useraccounts.user = users._id
      ${where}
      GROUP BY useraccounts.name
      ORDER BY score DESC
    ;`;

    let rows = await this.db.query(sql);

    const { totalNumberOfPraises, totalScore, periodBudget } =
      this.distributionStats(rows);

    if (devSupportPercentage > 0) {
      const devSupportScore = totalScore * (devSupportPercentage / 100);
      rows.push({
        identity_eth_address: this.devSupportAddress,
        rewards_eth_address: this.devSupportAddress,
        praise_count: 0,
        score: devSupportScore,
        useraccount_name: "praise-development-support",
        username: "praise-development-support",
      });
    }

    if (Array.isArray(rows) && rows.length > 0) {
      rows = this.filterNoRewardsAddress(rows);
      rows = this.filterReceivers(rows);
      this.log(`\nTotal number of praises: ${totalNumberOfPraises}`);
      this.log(`Total score: ${totalScore}`);
      this.log(`Total number of receivers: ${rows.length}`);
      this.log(`Period budget: ${periodBudget}`);
      return rows;
    }
    return [];
  }
}
