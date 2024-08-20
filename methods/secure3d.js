"use strict";

var crypto = require("crypto");
var currencyCodes = require("currency-codes");
var uuid = require("uuid/v1");
const HandlebarsRenderer = require("../utils/HandlebarsRenderer");

module.exports = function (nestpay) {
    nestpay.prototype.secure3d = function (value = {}) {
        var that = this;
        return new Promise(function (resolve, reject) {
            var currencyNumber = currencyCodes.code(value.currency || that.config.currency);
            currencyNumber = currencyNumber ? currencyNumber.number : "";
            var order = value.orderId ? (value.orderId == "Auto" ? uuid() : value.orderId) : that.config.orderId == "Auto" ? uuid() : "";

            var data = {
                form: {
                    clientId: that.config.clientId,
                    oid: order,
                    amount: value.amount || "",
                    okUrl: value.callbackSuccess || that.config.callbackSuccess,
                    failUrl: value.callbackFail || that.config.callbackFail,
                    rnd: value.timestamp || new Date().getTime(),
                    currency: currencyNumber,
                    pan: value.number || "",
                    Ecom_Payment_Card_ExpDate_Year: value.year || "",
                    Ecom_Payment_Card_ExpDate_Month: value.month || "",
                    cv2: value.cvv || "",
                    storetype: value.storetype || that.config.storetype,
                    lang: value.lang || that.config.lang,
                    processType: value.processType || that.config.processType,
                    hashAlgorithm: "ver3",
                },
                url: that.config.endpoints3d[that.config.endpoint],
            };

            // Ensure the hash is calculated with all required parameters, sorted and joined by '|'
            const sortedKeys = Object.keys(data.form).sort();
            const hashstr =
                sortedKeys
                    .map((key) => {
                        let value = data.form[key];
                        value = value === undefined || value === null ? "" : String(value);
                        return value;
                    })
                    .join("|") +
                "|" +
                (value.storekey || that.config.storekey);

            // Hash using SHA-512 and Base64 encode it
            data.form.hash = crypto.createHash("sha512").update(hashstr).digest("base64");

            // if secure format is set
            if (value.secureFormat === "html" || that.config.secureFormat === "html") {
                HandlebarsRenderer.render("secure", data).then(function (html) {
                    resolve(html);
                });
            }

            // if secure format is not set
            else {
                resolve(data);
            }
        });
    };
};
