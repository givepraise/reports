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
      ru.username AS users_username, 
      rac.name AS useraccounts_name, 
      ru.identityEthAddress AS users_identityEthAddress, 
      FLOOR(SUM(praises.score)) AS total_received_praise_score,
      MAX(CASE WHEN quantifications.quantifier IS NOT NULL THEN 1 ELSE 0 END) AS is_quantifier
    FROM praises
    LEFT JOIN useraccounts AS rac ON praises.receiver = rac._id
    LEFT JOIN users AS ru ON rac.user = ru._id
    LEFT JOIN quantifications ON quantifications.quantifier = ru._id
    ${where}
    GROUP BY ru.username, ru.identityEthAddress, rac.name
    ORDER BY total_received_praise_score DESC
  `;

    const rowsReceivers = await this.db.query(sqlReceivers);

    // SQL Query for given scores
    const sqlGivers = `
    SELECT 
      gu.username AS users_username,
      gac.name AS useraccounts_name, 
      gu.identityEthAddress AS users_identityEthAddress, 
      FLOOR(SUM(praises.score)) AS total_given_praise_score,
      MAX(CASE WHEN quantifications.quantifier IS NOT NULL THEN 1 ELSE 0 END) AS is_quantifier
    FROM praises
    LEFT JOIN useraccounts AS gac ON praises.giver = gac._id
    LEFT JOIN users AS gu ON gac.user = gu._id
    LEFT JOIN quantifications ON quantifications.quantifier = gu._id
    ${where}
    GROUP BY gu.username, gu.identityEthAddress, gac.name
    ORDER BY total_given_praise_score DESC
  `;

    const rowsGivers = await this.db.query(sqlGivers);

    // Prepare unique users from both givers and receivers
    const users = new Map();

    rowsReceivers.forEach((row, index) => {
      users.set(row.users_username, {
        users_username: row.users_username,
        users_identityEthAddress: row.users_identityEthAddress,
        useraccounts_name: row.useraccounts_name,
        total_received_praise_score: row.total_received_praise_score ?? 0,
        top_10_receiver: index < 10,
        top_50_receiver: index < 50,
        top_100_receiver: index < 100,
        total_given_praise_score: 0,
        top_10_giver: false,
        top_50_giver: false,
        top_100_giver: false,
        quantifier: !!row.is_quantifier,
      });
    });

    rowsGivers.forEach((row, index) => {
      const existingUser = users.get(row.users_username) || {
        users_username: row.users_username,
        users_identityEthAddress: row.users_identityEthAddress,
        useraccounts_name: row.useraccounts_name,
        total_received_praise_score: 0,
        top_10_receiver: false,
        top_50_receiver: false,
        top_100_receiver: false,
      };
      users.set(row.users_username, {
        ...existingUser,
        total_given_praise_score: row.total_given_praise_score ?? 0,
        top_10_giver: index < 10,
        top_50_giver: index < 50,
        top_100_giver: index < 100,
        quantifier: existingUser.is_quantifier || !!row.is_quantifier,
      });
    });

    // Filter users without users_identityEthAddress
    this.log(
      "Filtering users without identity eth addresses as they can't receive attestation."
    );
    let deletedCount = 0;
    users.forEach((user, key) => {
      if (!user.users_identityEthAddress) {
        users.delete(key);
        this.log(`- ${user.useraccounts_name}`);
        deletedCount++;
      }
    });
    this.log(`---\nDeleted ${deletedCount} users.`);

    return this.finish([...users.values()]); // Convert object to array and finish the report
  }
}
