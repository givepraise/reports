// TypeScript code
import BaseReport from "../base-report";
import Manifest from "./manifest.json";

export default class Report extends BaseReport {
  manifest = Manifest;

  async run() {
    const { startDate, endDate } = this.config;

    // If start and end dates are provided, generate SQL WHERE clause
    const where =
      startDate && endDate
        ? ` WHERE praises.createdAt > '${startDate}' AND praises.createdAt <= '${endDate}'`
        : "";

    // SQL Query for receiving scores
    const sqlReceivers = `
      SELECT
        rac.name AS useraccounts_name, 
        ru.identityEthAddress AS users_identityEthAddress, 
        FLOOR(SUM(praises.score)) AS total_received_praise_score
      FROM praises
      LEFT JOIN useraccounts AS rac ON praises.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      ${where}
      GROUP BY rac.name, ru.identityEthAddress
      ORDER BY total_received_praise_score DESC
    `;

    const rowsReceivers = await this.db.query(sqlReceivers);

    // Rank and map receivers data
    const rankedRowsReceivers = rowsReceivers.map((row, index) => ({
      useraccounts_name: row.useraccounts_name,
      users_identityEthAddress: row.users_identityEthAddress,
      total_received_praise_score: row.total_received_praise_score,
      top_10_receiver: index < 10,
      top_50_receiver: index < 50,
      top_100_receiver: index < 100,
    }));

    // SQL Query for given scores
    const sqlGivers = `
      SELECT 
        gac.name AS useraccounts_name, 
        gu.identityEthAddress AS users_identityEthAddress, 
        FLOOR(SUM(praises.score)) AS total_given_praise_score
      FROM praises
      LEFT JOIN useraccounts AS gac ON praises.giver = gac._id
      LEFT JOIN users AS gu ON gac.user = gu._id
      ${where}
      GROUP BY gac.name, gu.identityEthAddress
      ORDER BY total_given_praise_score DESC
    `;

    const rowsGivers = await this.db.query(sqlGivers);

    // Rank and map givers data
    const rankedRowsGivers = rowsGivers.map((row, index) => ({
      useraccounts_name: row.useraccounts_name,
      users_identityEthAddress: row.users_identityEthAddress,
      total_given_praise_score: row.total_given_praise_score,
      top_10_giver: index < 10,
      top_50_giver: index < 50,
      top_100_giver: index < 100,
    }));

    // Merge givers and receivers data, combining results by useraccounts_name
    const mergedDataset = [...rankedRowsReceivers, ...rankedRowsGivers].reduce(
      (acc, row) => {
        const { useraccounts_name, users_identityEthAddress, ...rest } = row;

        // If this user is not yet in the merged data, add them with current row's data
        if (!acc[useraccounts_name]) {
          acc[useraccounts_name] = {
            useraccounts_name,
            users_identityEthAddress,
            ...rest,
          };
        } else {
          // Otherwise, update existing user's data with current row's data
          acc[useraccounts_name] = {
            ...acc[useraccounts_name],
            ...Object.fromEntries(
              Object.entries(rest).map(([key, value]) => [
                key,
                acc[useraccounts_name][key] ?? value,
              ])
            ),
          };
        }

        return acc;
      },
      {}
    );

    return this.finish(Object.values(mergedDataset)); // Convert object to array and finish the report
  }
}
