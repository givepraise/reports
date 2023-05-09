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

    let sql = `SELECT 
        rac._id AS receiver_useraccounts_id, 
        rac.accountId AS receiver_useraccounts_accountId, 
        rac.name AS receiver_useraccounts_name, 
        rac.avatarId AS receiver_useraccounts_avatarId, 
        rac.platform AS receiver_useraccounts_platform,
        rac.createdAt AS receiver_useraccounts_createdAt,
        rac.updatedAt AS receiver_useraccounts_updatedAt,
        ru._id AS receiver_users_id,
        ru.username AS receiver_users_username, 
        ru.identityEthAddress AS receiver_users_identityEthAddress, 
        ru.rewardsEthAddress AS receiver_users_rewardsEthAddress, 
        ru.roles AS receiver_users_roles, 
        ru.createdAt AS receiver_users_createdAt, 
        ru.updatedAt AS receiver_users_updatedAt,
        SUM(praises.score) AS total_praise_score
      FROM praises
      LEFT JOIN useraccounts AS rac ON praises.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      ${where}
      GROUP BY rac._id, rac.accountId, rac.name, rac.avatarId, rac.platform, rac.createdAt, rac.updatedAt, ru._id, ru.username, ru.identityEthAddress, ru.rewardsEthAddress, ru.roles, ru.createdAt, ru.updatedAt
      ORDER BY total_praise_score DESC
    ;`;

    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
