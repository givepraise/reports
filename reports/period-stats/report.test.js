import Report from "./report.js";
import { initDuckDb } from "../../src/duckdb.js";

// Silence console.log
global.log = () => undefined;

describe("period-stats", () => {
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
    expect(report.manifest.name).toEqual("period-stats");
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result).toBeDefined();
    expect(result.length).toEqual(1);
    expect(result[0].praise_count).toEqual(1643);
    expect(result[0].score).toEqual(11480.63);
  });
});
