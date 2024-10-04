"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatus = exports.DriverStatus = exports.EmailNotificationType = exports.UserGroup = void 0;
var UserGroup;
(function (UserGroup) {
    UserGroup["USER"] = "user";
    UserGroup["ADMIN"] = "admin";
    UserGroup["DRIVER"] = "driver";
})(UserGroup || (exports.UserGroup = UserGroup = {}));
var EmailNotificationType;
(function (EmailNotificationType) {
    EmailNotificationType["DRIVER_REGISTERED_EMAIL"] = "DRIVER_REGISTERED_EMAIL";
    EmailNotificationType["USER_REQUEST_EMAIL"] = "USER_REQUEST_EMAIL";
    EmailNotificationType["USER_CREATED_EMAIL"] = "USER_CREATED_EMAIL";
    EmailNotificationType["USER_ACCEPT_EMAIL"] = "USER_ACCEPT_EMAIL";
    EmailNotificationType["DRIVER_REJECT_EMAIL"] = "DRIVER_REJECT_EMAIL";
    EmailNotificationType["DRIVER_QUOTATION_UPDATED_EMAIL"] = "DRIVER_QUOTATION_UPDATED_EMAIL";
    EmailNotificationType["DRIVER_QUOTE_EMAIL"] = "DRIVER_QUOTE_EMAIL";
    EmailNotificationType["DRIVER_ACCEPT_EMAIL"] = "DRIVER_ACCEPT_EMAIL";
    EmailNotificationType["DRIVER_NOTIFICATION_EMAIL"] = "DRIVER_NOTIFICATION_EMAIL";
    EmailNotificationType["USER_NOTIFICATION_EMAIL"] = "USER_NOTIFICATION_EMAIL";
    EmailNotificationType["USER_REJECT_EMAIL"] = "USER_REJECT_EMAIL";
})(EmailNotificationType || (exports.EmailNotificationType = EmailNotificationType = {}));
var DriverStatus;
(function (DriverStatus) {
    DriverStatus["ACCEPTED"] = "ACCEPTED";
    DriverStatus["REJECTED"] = "REJECTED";
    DriverStatus["QUOTED"] = "QUOTED";
    DriverStatus["PENDING"] = "PENDING";
})(DriverStatus || (exports.DriverStatus = DriverStatus = {}));
var UserStatus;
(function (UserStatus) {
    UserStatus["ACCEPTED"] = "ACCEPTED";
    UserStatus["REJECTED"] = "REJECTED";
    UserStatus["PENDING"] = "PENDING";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
