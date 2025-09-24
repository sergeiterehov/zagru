import { quotedIdentifier, quotedString } from "@duckdb/node-api";

export const idToSql = quotedIdentifier;
export const strToSql = quotedString;
export const selectorToSql = (name: string) => name.split(".").map(idToSql).join(".");
