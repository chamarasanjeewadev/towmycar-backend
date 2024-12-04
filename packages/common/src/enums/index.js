"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsNotificationType = exports.BreakdownRequestStatus = exports.BaseNotificationType = exports.UserStatus = exports.DriverStatus = exports.NotificationType = exports.UserGroup = void 0;
var UserGroup;
(function (UserGroup) {
    UserGroup["USER"] = "user";
    UserGroup["ADMIN"] = "admin";
    UserGroup["DRIVER"] = "driver";
})(UserGroup || (exports.UserGroup = UserGroup = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["DRIVER_REGISTERED"] = "DRIVER_REGISTERED";
    NotificationType["USER_REQUEST"] = "USER_REQUEST";
    NotificationType["USER_CREATED"] = "USER_CREATED";
    NotificationType["USER_ACCEPT"] = "USER_ACCEPT";
    NotificationType["DRIVER_REJECT"] = "DRIVER_REJECT";
    NotificationType["DRIVER_QUOTATION_UPDATED"] = "DRIVER_QUOTATION_UPDATED";
    NotificationType["DRIVER_ASSIGNED"] = "DRIVER_ASSIGNED";
    NotificationType["DRIVER_QUOTE"] = "DRIVER_QUOTE";
    NotificationType["DRIVER_ACCEPT"] = "DRIVER_ACCEPT";
    NotificationType["DRIVER_NOTIFICATION"] = "DRIVER_NOTIFICATION";
    NotificationType["USER_NOTIFICATION"] = "USER_NOTIFICATION";
    NotificationType["USER_REJECT"] = "USER_REJECT";
    NotificationType["RATING_REVIEW"] = "RATING_REVIEW";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["ACCEPTED"] = "ACCEPTED";
    DriverStatus["REJECTED"] = "REJECTED";
    DriverStatus["QUOTED"] = "QUOTED";
    DriverStatus["PENDING"] = "PENDING";
    DriverStatus["CLOSED"] = "CLOSED";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACCEPTED"] = "ACCEPTED";
    UserStatus["REJECTED"] = "REJECTED";
    UserStatus["PENDING"] = "PENDING";
    UserStatus["INPROGRESS"] = "INPROGRESS";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var BaseNotificationType;
(function (BaseNotificationType) {
    BaseNotificationType["EMAIL"] = "EMAIL";
    BaseNotificationType["SMS"] = "SMS";
    BaseNotificationType["PUSH"] = "PUSH";
})(BaseNotificationType || (exports.BaseNotificationType = BaseNotificationType = {}));
var BreakdownRequestStatus;
(function (BreakdownRequestStatus) {
    BreakdownRequestStatus["INPROGRESS"] = "INPROGRESS";
    BreakdownRequestStatus["WAITING"] = "WAITING";
    BreakdownRequestStatus["CLOSED"] = "CLOSED";
    BreakdownRequestStatus["QUOTED"] = "QUOTED";
})(BreakdownRequestStatus || (exports.BreakdownRequestStatus = BreakdownRequestStatus = {}));
var SmsNotificationType;
(function (SmsNotificationType) {
    SmsNotificationType["DRIVER_ASSIGNED"] = "DRIVER_ASSIGNED";
    SmsNotificationType["REQUEST_STATUS_UPDATE"] = "REQUEST_STATUS_UPDATE";
    SmsNotificationType["PAYMENT_CONFIRMATION"] = "PAYMENT_CONFIRMATION";
})(SmsNotificationType || (exports.SmsNotificationType = SmsNotificationType = {}));
