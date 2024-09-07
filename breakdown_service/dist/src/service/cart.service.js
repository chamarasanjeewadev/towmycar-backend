"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCart = exports.EditCart = exports.GetCart = exports.CreateCart = void 0;
const utils_1 = require("../utils");
const broker_1 = require("../utils/broker");
const CreateCart = (input, repo) => __awaiter(void 0, void 0, void 0, function* () {
    //  make a call to our catalog microservice
    // synchronize call
    console.log("inside create cart", input);
    const product = yield (0, broker_1.GetProductDetails)(input.productId);
    utils_1.logger.info("product info", product);
    if (product.stock < input.qty) {
        throw new utils_1.NotFoundError("product is out of stock");
    }
    return yield repo.createCart(input.customerId, {
        productId: product.id,
        price: product.price.toString(),
        qty: input.qty,
        itemName: product.name,
        variant: product.variant,
    });
});
exports.CreateCart = CreateCart;
const GetCart = (id, repo) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield repo.findCart(id);
    if (!data) {
        throw new utils_1.NotFoundError("cart not found");
    }
    return data;
});
exports.GetCart = GetCart;
const EditCart = (input, repo) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield repo.updateCart(input.id, input.qty);
    return data;
});
exports.EditCart = EditCart;
const DeleteCart = (id, repo) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield repo.deleteCart(id);
    return data;
});
exports.DeleteCart = DeleteCart;
