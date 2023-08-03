import Report from "./report.js";
import { initDuckDb } from "../../src/duckdb.js";

describe("attest-givers", () => {
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
    expect(report.manifest.name).toEqual("attest-givers");
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toEqual(42);
    expect(result.rows[0].giver_useraccounts_name).toEqual("iviangita#3204");
    expect(result.rows[0].total_praise_score).toEqual(4736);
  });
});
