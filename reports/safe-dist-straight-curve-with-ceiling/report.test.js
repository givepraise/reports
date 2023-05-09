import Report from "./report.js";
import { initDuckDb } from "../../src/duckdb.js";

describe("dist-straight-curve-with-ceiling", () => {
  let db;
  let report;

  beforeAll(async () => {
    db = await initDuckDb();
  });
  test("setup should succeed", async () => {
    const config = {
      startDate: "2021-09-30",
      endDate: "2021-10-31",
      ceiling: 9.25,
      cutoff: 200,
      tokenType: "erc20",
      tokenAddress: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
      devSupportPercentage: 3,
    };

    report = new Report(config, db);
    expect(report).toBeDefined();
    expect(report.manifest).toBeDefined();
    expect(report.manifest.name).toEqual(
      "safe-dist-straight-curve-with-ceiling"
    );
  });
  test("run should succeed and return expected results", async () => {
    const result = await report.run();
    expect(result.rows).toBeDefined();
    expect(result.rows.length).toEqual(68);
    expect(result.rows[0]).toEqual({
      amount: 0.6312500121265273,
      id: "",
      receiver: "0x320c338BCF70bAAaE26e96201C33B48105Bc62C2",
      token_address: "0x9C58BAcC331c9aa871AFD802DB6379a98e80CEdb",
      token_type: "erc20",
    });
  });
});
