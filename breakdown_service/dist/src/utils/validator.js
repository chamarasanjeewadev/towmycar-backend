"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRequest = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default();
const ValidateRequest = (requestBody, schema) => {
    var _a;
    const validatedData = ajv.compile(schema);
    if (validatedData(requestBody)) {
        return false;
    }
    const errors = (_a = validatedData.errors) === null || _a === void 0 ? void 0 : _a.map((err) => err.message);
    return errors && errors[0];
};
exports.ValidateRequest = ValidateRequest;
