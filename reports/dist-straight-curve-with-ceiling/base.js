export default class BaseReport {
  /**
   * Validate that any required config parameters are present.
   */
  constructor(config, db) {
    if (!config.cutoff || !config.ceiling) {
      throw new Error(
        "Missing cutoff or ceiling in config. Please provide both."
      );
    }
    this.config = config;
    this.db = db;
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
      log(`\nFiltering ${noRewards.length} rows with no rewardsEthAddress:`);
      log(`\nuseraccount, score`);
      noRewards.forEach((row) => {
        log(`${row.useraccount_name}, ${row.score}`);
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
      log(
        `\nFiltering ${filterReceivers.length} receivers based on setting "filterReceivers":`
      );
      log(`\nuseraccount, score`);
      filterReceivers.forEach((filterReceiver) => {
        log(
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
    log(`\nTotal number of praises: ${totalNumberOfPraises}`);

    const totalScore = rows.reduce((acc, row) => acc + row.score, 0).toFixed(2);
    log(`Total score: ${totalScore}`);

    // Total number of receivers
    log(`Total number of receivers: ${rows.length}`);

    const periodBudget =
      totalNumberOfPraises > cutoff
        ? ceiling
        : (totalNumberOfPraises / cutoff) * ceiling;
    log(`Period budget: ${periodBudget}`);

    return { totalNumberOfPraises, totalScore, periodBudget };
  }

  /**
   * Query database for period praise receivers, scores and number of praise.
   * Filter out rows with no rewardsEthAddress and rows in filterReceivers.
   */
  async run() {
    const { startDate, endDate } = this.config;
    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : "";

    let sql = `SELECT 
      useraccounts.name as useraccount_name,
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

    let rows = await this.db.query(sql);

    if (Array.isArray(rows) && rows.length > 0) {
      rows = this.filterNoRewardsAddress(rows);
      rows = this.filterReceivers(rows);
      return rows;
    }
    return;
  }
}
