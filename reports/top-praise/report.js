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
        p.*,
        gu.username AS giver_users_username, gu.identityEthAddress AS giver_users_identityEthAddress, gu.rewardsEthAddress AS giver_users_rewardsEthAddress, gu.roles AS giver_users_roles, gu.createdAt AS giver_users_createdAt, gu.updatedAt AS giver_users_updatedAt,
        gac.accountId AS giver_useraccounts_accountId, gac.user as giver_useraccounts_user, gac.name AS giver_useraccounts_name, gac.avatarId AS giver_useraccounts_avatarId, gac.platform AS giver_useraccounts_platform, gac.createdAt AS giver_useraccounts_createdAt, gac.updatedAt AS giver_useraccounts_updatedAt,
        ru.username AS receiver_users_username, ru.identityEthAddress AS receiver_users_identityEthAddress, ru.rewardsEthAddress AS receiver_users_rewardsEthAddress, ru.roles AS receiver_users_roles, ru.createdAt AS receiver_users_createdAt, ru.updatedAt AS receiver_users_updatedAt,
        rac.accountId AS receiver_useraccounts_accountId, rac.user as receiver_useraccounts_user, rac.name AS receiver_useraccounts_name, rac.avatarId AS receiver_useraccounts_avatarId, rac.platform AS receiver_useraccounts_platform, rac.createdAt AS receiver_useraccounts_createdAt, rac.updatedAt AS receiver_useraccounts_updatedAt
      FROM praises AS p
      LEFT JOIN useraccounts AS gac ON p.giver = gac._id
      LEFT JOIN users AS gu ON gac.user = gu._id
      LEFT JOIN useraccounts AS rac ON p.receiver = rac._id
      LEFT JOIN users AS ru ON rac.user = ru._id
      WHERE p.createdAt > '${startDate}' AND p.createdAt <= '${endDate}'         
      ORDER BY p.score DESC
      LIMIT 100
    ;`;

    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
