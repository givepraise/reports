export default class BaseReport {
  logData = "";

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
