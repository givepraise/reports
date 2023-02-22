import Report from "./report.js";
import { initDuckDb } from "../../src/duckdb.js";

describe("period-receiver-summary", () => {
  let db;
  let report;

  beforeAll(async () => {
    db = await initDuckDb();
  });
  test("setup should succeed", async () => {
    const config = {
      startDate: "2021-09-30",
      endDate: "2021-10-31",
    };

    report = new Report(config, db);
    expect(report).toBeDefined();
    expect(report.manifest).toBeDefined();
    expect(report.manifest.name).toEqual("period-receiver-summary");
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toEqual(134);
    expect(result.rows[0]).toEqual({
      name: "divine_comedian#5493",
      username: "divine_comedian",
      identity_eth_address: "0x320c338BCF70bAAaE26e96201C33B48105Bc62C2",
      rewards_eth_address: "0x320c338BCF70bAAaE26e96201C33B48105Bc62C2",
      praise_count: 74,
      score: 705.62,
    });
  });
});
