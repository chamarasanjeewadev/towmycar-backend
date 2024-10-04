"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEditRequestSchema = exports.UserRequestSchema = void 0;
var typebox_1 = require("@sinclair/typebox");
exports.UserRequestSchema = typebox_1.Type.Object({
    name: typebox_1.Type.String(),
    email: typebox_1.Type.String(),
});
exports.UserEditRequestSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer(),
    email: typebox_1.Type.String(),
});
