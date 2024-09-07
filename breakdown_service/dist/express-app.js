"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const utils_1 = require("./utils");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(utils_1.httpLogger);
app.use(cart_routes_1.default);
app.use(order_routes_1.default);
app.use("/", (req, res, _) => {
    return res.status(200).json({ message: "I am healthy!" });
});
app.use(utils_1.HandleErrorWithLogger);
exports.default = app;
