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
        gu._id AS giver_users_id,
        gu.username AS giver_users_username, 
        gu.identityEthAddress AS giver_users_identityEthAddress, 
        gu.rewardsEthAddress AS giver_users_rewardsEthAddress, 
        gu.roles AS giver_users_roles, 
        gu.createdAt AS giver_users_createdAt, 
        gu.updatedAt AS giver_users_updatedAt,
        gac._id AS giver_useraccounts_id, 
        gac.accountId AS giver_useraccounts_accountId, 
        gac.name AS giver_useraccounts_name, 
        gac.avatarId AS giver_useraccounts_avatarId, 
        gac.platform AS giver_useraccounts_platform,
        gac.createdAt AS giver_useraccounts_createdAt,
        gac.updatedAt AS giver_useraccounts_updatedAt,
        SUM(praises.score) AS total_praise_score
      FROM praises
      LEFT JOIN useraccounts AS gac ON praises.giver = gac._id
      LEFT JOIN users AS gu ON gac.user = gu._id
      ${where}
      GROUP BY gu._id, gu.username, gu.identityEthAddress, gu.rewardsEthAddress, gu.roles, gu.createdAt, gu.updatedAt, gac._id, gac.accountId, gac.user, gac.name, gac.avatarId, gac.platform, gac.createdAt, gac.updatedAt
      ORDER BY total_praise_score DESC
      LIMIT 100
    ;`;

    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
