"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const service = __importStar(require("../service/cart.service"));
const repository = __importStar(require("../repository/cart.repository"));
const validator_1 = require("../utils/validator");
const cartRequest_do_1 = require("../dto/cartRequest.do");
const router = express_1.default.Router();
const repo = repository.CartRepository;
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // jwt
    const isValidUser = true;
    if (!isValidUser) {
        return res.status(403).json({ error: "authorization error" });
    }
    next();
});
router.post("/user/breakdowns", authMiddleware, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("inside breakdowns post");
        const error = (0, validator_1.ValidateRequest)(req.body, cartRequest_do_1.CartRequestSchema);
        console.log("request validated", error);
        if (error) {
            return res.status(404).json({ error });
        }
        // publish to db
        const response = yield service.CreateCart(req.body, repo);
        // publish event to rabbitmq
        // {
        //   "eventType": "BreakdownRequestEvent",
        //   "breakdownRequestId": "req5678",
        //   "userId": "user123",
        //   "location": {"latitude": "37.7749", "longitude": "-122.4194"},
        //   "vehicleDetails": {"make": "Toyota", "model": "Camry", "year": "2020"},
        //   "description": "Flat tire"
        // }
        console.log(response);
        return res.status(200).json(response);
    }
    catch (error) {
        return res.status(404).json({ error });
    }
}));
router.get("/cart", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // comes from our auth user parsed from JWT
    const response = yield service.GetCart(req.body.customerId, repo);
    return res.status(200).json(response);
}));
router.patch("/cart/:lineItemId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const liteItemId = req.params.lineItemId;
    const response = yield service.EditCart({
        id: +liteItemId,
        qty: req.body.qty,
    }, repo);
    return res.status(200).json(response);
}));
router.delete("/cart/:lineItemId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const liteItemId = req.params.lineItemId;
    console.log(liteItemId);
    const response = yield service.DeleteCart(+liteItemId, repo);
    return res.status(200).json(response);
}));
exports.default = router;
