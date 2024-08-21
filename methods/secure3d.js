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
                    amount: value.amount || "",
                    okUrl: value.callbackSuccess || that.config.callbackSuccess,
                    failUrl: value.callbackFail || that.config.callbackFail,
                    callbackUrl: value.callbackFail || that.config.callbackFail,
                    currency: currencyNumber,
                    rnd: value.timestamp || new Date().getTime(),
                    storeType: value.storetype || that.config.storetype,
                    storeKey: value.storekey || that.config.storekey,
                    lang: value.lang || that.config.lang,
                    hashAlgorithm: "ver3",
                    BillToName: "name",
                    BillTocompany: "billToCompany",
                    refreshTime: 5,
                    oid: order,
                    pan: value.number || "",
                    Ecom_Payment_Card_ExpDate_Year: value.year || "",
                    Ecom_Payment_Card_ExpDate_Month: value.month || "",
                    cv2: value.cvv || "",
                    processType: value.processType || that.config.processType,
                    TranType: "Auth",
                },
                url: that.config.endpoints3d[that.config.endpoint],
            };

            console.log("data:", data.form);

            // Belirtilen parametrelerin sıralı bir dizisini oluştur
            const requiredKeys = ["amount", "callbackUrl", "clientid", "currency", "failUrl", "hashAlgorithm", "lang", "okurl", "refreshtime", "rnd", "storeType", "TranType"];

            // Belirtilen parametreleri | ile birleştir
            const hashstr =
                requiredKeys
                    .map((key) => {
                        let value = data.form[key];
                        value = value === undefined || value === null ? "" : String(value);
                        return value;
                    })
                    .join("|") +
                "|" +
                (data.form.storeKey || that.config.storekey);

            console.log("hashstr", hashstr);

            // SHA-512 algoritması ile hashleyin ve Base64 ile kodlayın
            data.form.hash = crypto.createHash("sha512").update(hashstr).digest("base64");

            console.log("hash", data.form.hash);

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
