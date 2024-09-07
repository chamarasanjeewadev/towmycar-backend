"use strict";
/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    clearMocks: true,
    collectCoverage: true,
    verbose: true,
    coverageDirectory: "coverage",
    coveragePathIgnorePatterns: ["/node_modules"],
    coverageProvider: "v8",
    moduleDirectories: ["node_modules", "src"],
};
exports.default = config;
