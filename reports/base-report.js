export default class BaseReport {
  logData = "";
  devSupportAddress = "0x0B7246eF74Ca7b37Fdc3D15be4f0b49876622F95";

  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

  log(message) {
    this.logData += `${message}\n`;
  }

  async run() {
    throw new Error("Not implemented");
  }

  finish(rows) {
    return { rows, log: this.logData };
  }
}
