"use strict";

var crypto = require("crypto");
var currencyCodes = require("currency-codes");

module.exports = function (nestpay) {
    nestpay.prototype.securePurchase = function (value = {}) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var currencyNumber = currencyCodes.code(value.currency || that.config.currency);
            currencyNumber = currencyNumber ? currencyNumber.number : "";

            var data = {
                Name: that.config.name,
                Password: that.config.password,
                ClientId: that.config.clientId,
                OrderId: value.orderId ? value.orderId : value.oid,
                GroupId: value.groupId || "",
                Type: "Auth",
                Number: value.md,
                PayerAuthenticationCode: value.cavv,
                PayerSecurityLevel: value.eci,
                PayerTxnId: value.xid,
                Currency: currencyNumber,
            };

            var url = that.config.endpoints[that.config.endpoint];
            that.request(url, data).then(resolve).catch(reject);
        });
    };
};
