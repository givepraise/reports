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

    let sql = `
        WITH ranked_quantifications AS (
          SELECT
            *,
            ROW_NUMBER() OVER (PARTITION BY quantifications.praise ORDER BY quantifications.createdAt) AS quantification_row
          FROM quantifications
        ), combined_data AS (
        SELECT 
          praises._id as id,
          praises.createdAt as date,
          rac.name as to_user_account,
          rac._id as to_user_account_id,
          ru.identityEthAddress as to_eth_address,
          gac.name as from_user_account,
          gac._id as from_user_account_id,
          gu.identityEthAddress as from_eth_address,
          praises.reason as reason,
          praises.sourceId as source_id,
          praises.sourceName as source_name,
          ranked_quantifications.score as score,
          ranked_quantifications.duplicatePraise as duplicate_praise,
          ranked_quantifications.dismissed as dismissed,
          qu.username as quantifier_username,
          qu.identityEthAddress as quantifier_eth_address,
          ranked_quantifications.quantification_row
        FROM
          praises
          LEFT JOIN useraccounts gac ON praises.giver = gac._id
          LEFT JOIN users gu ON gac.user = gu._id
          LEFT JOIN useraccounts rac ON praises.receiver = rac._id
          LEFT JOIN users ru ON rac.user = ru._id
          LEFT JOIN quantifications ON praises._id = quantifications.praise
          LEFT JOIN ranked_quantifications ON quantifications._id = ranked_quantifications._id
          LEFT JOIN users qu ON ranked_quantifications.quantifier = qu._id
          ${where}
      )
      SELECT 
        id,
        date,
        to_user_account,
        to_user_account_id,
        to_eth_address,
        from_user_account,
        from_user_account_id,
        from_eth_address,
        reason,
        source_id,
        source_name,
        MAX(CASE WHEN quantification_row = 1 THEN score ELSE NULL END) AS "score 1",
        MAX(CASE WHEN quantification_row = 2 THEN score ELSE NULL END) AS "score 2",
        MAX(CASE WHEN quantification_row = 3 THEN score ELSE NULL END) AS "score 3",
        MAX(CASE WHEN quantification_row = 4 THEN score ELSE NULL END) AS "score 4",
        MAX(CASE WHEN quantification_row = 5 THEN score ELSE NULL END) AS "score 5",
        MAX(CASE WHEN quantification_row = 1 THEN duplicate_praise ELSE NULL END) AS "duplicate id 1",
        MAX(CASE WHEN quantification_row = 2 THEN duplicate_praise ELSE NULL END) AS "duplicate id 2",
        MAX(CASE WHEN quantification_row = 3 THEN duplicate_praise ELSE NULL END) AS "duplicate id 3",
        MAX(CASE WHEN quantification_row = 4 THEN duplicate_praise ELSE NULL END) AS "duplicate id 4",
        MAX(CASE WHEN quantification_row = 5 THEN duplicate_praise ELSE NULL END) AS "duplicate id 5",        
        MAX(CASE WHEN quantification_row = 1 THEN dismissed ELSE NULL END) AS "dismissed 1",
        MAX(CASE WHEN quantification_row = 2 THEN dismissed ELSE NULL END) AS "dismissed 2",
        MAX(CASE WHEN quantification_row = 3 THEN dismissed ELSE NULL END) AS "dismissed 3",
        MAX(CASE WHEN quantification_row = 4 THEN dismissed ELSE NULL END) AS "dismissed 4",
        MAX(CASE WHEN quantification_row = 5 THEN dismissed ELSE NULL END) AS "dismissed 5",
        MAX(CASE WHEN quantification_row = 1 THEN quantifier_username ELSE NULL END) AS "quantifier 1 username",
        MAX(CASE WHEN quantification_row = 1 THEN quantifier_eth_address ELSE NULL END) AS "quantifier 1 eth address",
        MAX(CASE WHEN quantification_row = 2 THEN quantifier_username ELSE NULL END) AS "quantifier 2 username",
        MAX(CASE WHEN quantification_row = 2 THEN quantifier_eth_address ELSE NULL END) AS "quantifier 2 eth address",
        MAX(CASE WHEN quantification_row = 3 THEN quantifier_username ELSE NULL END) AS "quantifier 3 username",
        MAX(CASE WHEN quantification_row = 3 THEN quantifier_eth_address ELSE NULL END) AS "quantifier 3 eth address",
        MAX(CASE WHEN quantification_row = 4 THEN quantifier_username ELSE NULL END) AS "quantifier 4 username",
        MAX(CASE WHEN quantification_row = 4 THEN quantifier_eth_address ELSE NULL END) AS "quantifier 4 eth address",
        MAX(CASE WHEN quantification_row = 5 THEN quantifier_username ELSE NULL END) AS "quantifier 5 username",
        MAX(CASE WHEN quantification_row = 5 THEN quantifier_eth_address ELSE NULL END) AS "quantifier 5 eth address",
        AVG(score) AS "avg score"
        FROM combined_data
        GROUP BY id, date, to_user_account, to_user_account_id, to_eth_address, from_user_account, from_user_account_id, from_eth_address, reason, source_id, source_name
        ORDER BY date
        ;`;
    const rows = await this.db.query(sql);
    return this.finish(rows);
  }
}
