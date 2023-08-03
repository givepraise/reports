import Report from "./report.js";
import { initDuckDb } from "../../src/duckdb.js";

describe("attestations", () => {
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
    expect(report.manifest.name).toEqual("attestations");
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toEqual(135);
    expect(result.rows[0].useraccounts_name).toEqual("divine_comedian#5493");
    expect(result.rows[0].total_received_praise_score).toEqual(703);
  });
});
