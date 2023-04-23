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
    expect(report.manifest.name).toEqual("top-praise");
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result.rows).toBeDefined();
    console.log(result.rows[0]);
    expect(result.rows.length).toEqual(100);
    expect(result.rows[0].score).toEqual(82.5);
    expect(result.rows[0].reason).toEqual(
      "for the success of Token Engineering Academy"
    );
  });
});
