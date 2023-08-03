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

    let sqlReceivers = `SELECT 
        rac.name AS useraccounts_name, 
        ru.identityEthAddress AS users_identityEthAddress, 
        FLOOR(SUM(praises.score)) AS total_received_praise_score
      FROM praises
      LEFT JOIN useraccounts AS rac ON praises.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      ${where}
      GROUP BY rac.name, ru.identityEthAddress
      ORDER BY total_received_praise_score DESC
    ;`;

    const rowsReceivers = await this.db.query(sqlReceivers);

    const rankedRowsReceivers = rowsReceivers.map((row, index) => ({
      ...row,
      top_10_receiver: index < 10,
      top_50_receiver: index < 50,
      top_100_receiver: index < 100,
    }));

    let sqlGivers = `SELECT 
      gac.name AS useraccounts_name, 
      gu.identityEthAddress AS users_identityEthAddress, 
      FLOOR(SUM(praises.score)) AS total_given_praise_score
    FROM praises
    LEFT JOIN useraccounts AS gac ON praises.giver = gac._id
    LEFT JOIN users AS gu ON gac.user = gu._id
    ${where}
    GROUP BY gac.name, gu.identityEthAddress
    ORDER BY total_given_praise_score DESC
  ;`;

    const rowsGivers = await this.db.query(sqlGivers);

    const rankedRowsGivers = rowsGivers.map((row, index) => ({
      ...row,
      top_10_giver: index < 10,
      top_50_giver: index < 50,
      top_100_giver: index < 100,
    }));

    // MERGING GIVERS AND RECEIVERS DATA
    const mergedDataset = [...rankedRowsReceivers, ...rankedRowsGivers].reduce(
      (acc, row) => {
        const { useraccounts_name, users_identityEthAddress, ...rest } = row;

        if (!acc[useraccounts_name]) {
          acc[useraccounts_name] = {
            useraccounts_name,
            users_identityEthAddress,
            ...rest,
          };
        } else {
          acc[useraccounts_name] = {
            ...acc[useraccounts_name],
            ...rest,
          };
        }

        return acc;
      },
      {}
    );

    return this.finish(Object.values(mergedDataset));
  }
}
