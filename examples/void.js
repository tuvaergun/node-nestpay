var nodeNestpay = require('../index.js');

nestpay = new nodeNestpay({
    name: 'AKTESTAPI',
    password: 'AKBANK01',
    clientId: 100100000,
    endpoint: 'asseco',
    currency: 'TRY'
});

nestpay.purchase({
    number: '5456165456165454',
    year: '12',
    month: '12',
    cvv: '000',
    amount: '10'
}).then(function (purchaseResult) {

    console.log('Purchased');
    console.log(purchaseResult);

    nestpay.void({orderId: purchaseResult.OrderId}).then(function (voidResult) {

        console.log('Canceled');
        console.log(voidResult);

    }).catch(function (voidError) {

        console.log(voidError);
    });

}).catch(function (purchaseError) {

    console.log(purchaseError);

});