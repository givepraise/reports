import { StaticModuleRecord } from "@endo/static-module-record";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Converts JSON to a JS object
 */
function convertJSONToJSObject(json) {
  const jsObjectString = json
    .replace(/^\{/, "export default {")
    .replace(/\}$/, "};");
  return jsObjectString;
}

/**
 * Imports with or without .js extension supported
 */
function importModule(moduleSpecifier) {
  // Add .js to end of module specifier if it doesn't already have it (or .json)
  if (!moduleSpecifier.endsWith(".js") && !moduleSpecifier.endsWith(".json")) {
    moduleSpecifier += ".js";
  }

  // Read file from disk
  const modulePath = path.resolve(__dirname, `../reports/${moduleSpecifier}`);
  const moduleText = fs.readFileSync(modulePath, "utf8");

  // If it's a JSON file, convert it to a JS object
  const processedModuleText = moduleSpecifier.endsWith(".json")
    ? convertJSONToJSObject(moduleText)
    : moduleText;

  return new StaticModuleRecord(processedModuleText, moduleSpecifier);
}

/**
 * Resolver for SES Compartment, currently only supports relative imports
 */
function resolveModule(moduleSpecifier, moduleReferrer) {
  const moduleReferrerFolder = moduleReferrer.replace(/\/[^\/]*$/, "");
  return `${moduleReferrerFolder}/${moduleSpecifier}`;
}

export function createCompartment() {
  const compartment = new Compartment(
    {
      Math,
    },
    {},
    {
      resolveHook: resolveModule,
      importHook: importModule,
    }
  );

  return compartment;
}
