"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartEditRequestSchema = exports.CartRequestSchema = void 0;
const typebox_1 = require("@sinclair/typebox");
exports.CartRequestSchema = typebox_1.Type.Object({
    productId: typebox_1.Type.Integer(),
    customerId: typebox_1.Type.Integer(),
    qty: typebox_1.Type.Integer(),
});
exports.CartEditRequestSchema = typebox_1.Type.Object({
    id: typebox_1.Type.Integer(),
    qty: typebox_1.Type.Integer(),
});
