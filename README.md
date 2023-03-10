# Praise Reports

Praise allows for creating custom reports. This repository is the official library of Praise reports.

To use a report in the Praise dashboard ... TODO

## Run reports locally

This repository contains a CLI for running reports locally. The CLI takes two arguments: the name of the report and the report config as a JSON string.

A local database is used for running reports. The database is populated with live data from the Praise instance of the [Token Engineering Commons](https://praise.tecommons.org).

```bash
yarn
node src/index.js <reportName> <config>
```

Examples:

```bash
node src/index.js period-stats/report '{"startDate": "2021-11-01", "endDate": "2021-11-30"}'
```

```bash
node src/index.js period-receiver-summary/report '{"startDate": "2021-11-01", "endDate": "2021-11-07"}'
```

## Test all reports

```bash
yarn
yarn test
```

## Create a new report

### Report folder structure

- Reports are stored in the `reports` folder.
- Every subfolder in the `reports` folder is a report.
- A report folder can contain more than one report version. Multiple reports in one folder should be different versions/flavours of the same report.

```bash
reports
├── my-report
│   ├── report.js
│   ├── report.test.js
│   ├── report-version2.js
│   ├── report-version2.test.js
│   ├── README.md
```

### Report class

Each JavaScript report file must export a class conforms to the following interface:

- A report class must have a `manifest` property. See below for details.
- A report class must have a constructor that takes two arguments: `config` and `db`.
- A report class must have a `run` method that returns an array of objects.
- The `run` method can be async.

```js
export default class Report {
  manifest = {
    name: "simple-report",
    ... // See below
  };

  constructor(config, db) {
    this.config = config;
    this.db = db;
  }

  async run() {
    // Return an array of objects
  }
}
```

Reports are run in a sandboxed environment. The `config` and `db` arguments are passed to the constructor by the Praise dashboard. In addition, the following objects are available in the sandbox:

- `Math` - The JavaScript Math object
- `log()` - A function that logs to the Praise dashboard. Report logs are displayed in the Praise dashboard after the report has been run.

### Report configuration

Each report should accept a

### Db object

The `db` object is a wrapper around the Praise database. It has the following methods:

```js
db.query(sql);
```

### Report manifest

Report settings are heavily inspired by VS Code's settings.
See https://code.visualstudio.com/api/references/contribution-points#contributes.configuration

```js
const manifest = {
  name: "simple-report",
  displayName: "Simple Report",
  description: "A simple report.",
  version: "1.2.3",
  author: "General Magic",
  publisher: "general-magic",
  license: "MIT",
  repository: "https://github.com/givepraise/praise-reports",
  bugs: "https://github.com/givepraise/praise-reports/issues",
  categories: ["Basic reports", "Praise receiver reports"],
  keywords: ["toplist"],
  configuration: {
    stringSetting: {
      type: "string",
      default: "Some string",
      description: "Description of the string setting",
      markdownDescription: "Description of the string setting",
      editPresentation: "multiline", // If this is not set, the setting is rendered as a single line
      order: 1,
    },
    numberSetting: {
      type: "number",
      default: 42,
      description: "Description of the number setting",
      markdownDescription: "Description of the number setting",
      order: 2,
    },
    booleanSetting: {
      type: "boolean",
      default: true,
      description: "Description of the boolean setting",
      markdownDescription: "Description of the boolean setting",
      order: 3,
    },
    stringEnumSetting: {
      type: "string",
      default: "right",
      enum: ["left", "right"],
      enumDescriptions: ["Left", "Right"], // Not supported yet
      enumMarkdownDescriptions: ["Left", "Right"], // Not supported yet
      enumItemLabels: ["Left", "Right"], // Not supported yet
      description: "Description of the string setting",
      markdownDescription: "Description of the string setting",
      editPresentation: "multiline",
      order: 4,
    },
    stringArraySetting: {
      type: "array",
      items: {
        type: "string",
      },
      default: ["one", "two"],
      description: "Description of the string array setting",
      markdownDescription: "Description of the string array setting",
      order: 5,
    },
  },
};
```
