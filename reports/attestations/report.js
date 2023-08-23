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

    // Prepare unique users from both givers and receivers
    const users = new Map();

    rowsReceivers.forEach((row, index) => {
      users.set(row.useraccounts_name, {
        useraccounts_name: row.useraccounts_name,
        users_identityEthAddress: row.users_identityEthAddress,
        total_received_praise_score: row.total_received_praise_score ?? 0,
        top_10_receiver: index < 10,
        top_50_receiver: index < 50,
        top_100_receiver: index < 100,
        total_given_praise_score: 0,
        top_10_giver: false,
        top_50_giver: false,
        top_100_giver: false,
      });
    });

    rowsGivers.forEach((row, index) => {
      const existingUser = users.get(row.useraccounts_name) || {
        useraccounts_name: row.useraccounts_name,
        users_identityEthAddress: row.users_identityEthAddress,
        total_received_praise_score: 0,
        top_10_receiver: false,
        top_50_receiver: false,
        top_100_receiver: false,
      };
      users.set(row.useraccounts_name, {
        ...existingUser,
        total_given_praise_score: row.total_given_praise_score ?? 0,
        top_10_giver: index < 10,
        top_50_giver: index < 50,
        top_100_giver: index < 100,
      });
    });

    // Filter users without users_identityEthAddress
    this.log(
      "\nFiltering users without identity eth addresses as they can't receive attestation."
    );
    let deletedCount = 0;
    users.forEach((user, key) => {
      if (!user.users_identityEthAddress) {
        users.delete(key);
        this.log(`- ${key}`);
        deletedCount++;
      }
    });
    this.log(
      `---\nDeleted ${deletedCount} users without identity eth addresses.`
    );

    return this.finish([...users.values()]); // Convert object to array and finish the report
  }
}
