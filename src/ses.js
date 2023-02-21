import { StaticModuleRecord } from "@endo/static-module-record";
import { fileURLToPath } from "url";
import fs from "fs";
import { log } from "./report.js";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Imports with or without .js extension supported
 */
function importModule(moduleSpecifier) {
  // Add .js to end of module specifier if it doesn't already have it
  if (!moduleSpecifier.endsWith(".js")) {
    moduleSpecifier += ".js";
  }

  const moduleText = fs.readFileSync(
    path.resolve(__dirname, `../reports/${moduleSpecifier}`),
    "utf8"
  );

  return new StaticModuleRecord(moduleText, moduleSpecifier);
}

/**
 * Resolver for SES Compartment, currently only supports relative imports
 */
function resolveModule(moduleSpecifier, moduleReferrer) {
  const folderName = moduleReferrer.split("/")[0];
  const fileName = moduleSpecifier.split("/")[1];
  return `${folderName}/${fileName}`;
}

export function createCompartment() {
  const compartment = new Compartment(
    {
      Math,
      log: harden(log),
    },
    {},
    {
      resolveHook: resolveModule,
      importHook: importModule,
    }
  );

  return compartment;
}
