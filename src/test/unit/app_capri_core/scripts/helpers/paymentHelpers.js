'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockCollections = require('../../../../mocks/util/collections');
var ArrayList = require('../../../../mocks/dw.util.Collection');
var PaymentModel = {
    paymentObject: sinon.stub()
};

var paymentHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/paymentHelpers', {
    'dw/system/Transaction': {
        wrap: function (callback) {
            return callback();
        }
    },
    '*/cartridge/scripts/util/collections': mockCollections,
    '*/cartridge/models/payment': PaymentModel
});

function getPaymentCollection(method1, method2) {
    var paymentcollection = new ArrayList([
        {
            UUID: 'ID1',
            creditCardNumberLastDigits: '1111',
            creditCardHolder: 'The Muffin Man',
            creditCardExpirationYear: 2024,
            creditCardType: 'Visa',
            maskedCreditCardNumber: '************1111',
            paymentMethod: 'CREDIT_CARD',
            creditCardExpirationMonth: 1,
            creditCardExpired: false,
            paymentTransaction: {
                amount: {
                    value: 0
                }
            },
            custom: {
                defaultPaymentMethod: method1
            }
        },
        {
            UUID: 'ID2',
            giftCertificateCode: 'someString',
            maskedGiftCertificateCode: 'some masked string',
            paymentMethod: 'GIFT_CERTIFICATE',
            paymentTransaction: {
                amount: {
                    value: 0
                }
            },
            custom: {
                defaultPaymentMethod: method2
            }
        }
    ]);
    return paymentcollection;
}
var paymentInstrumentObject = {
    UUID: 'ID1',
    creditCardNumberLastDigits: '1111',
    creditCardHolder: 'The Muffin Man',
    creditCardExpirationYear: 2024,
    creditCardType: 'Visa',
    maskedCreditCardNumber: '************1111',
    paymentMethod: 'CREDIT_CARD',
    creditCardExpirationMonth: 1,
    creditCardExpired: false,
    paymentTransaction: {
        amount: {
            value: 0
        }
    },
    custom: {
        defaultPaymentMethod: true
    }
};

describe('Helpers - Payment', function () {
    PaymentModel.paymentObject.returns(paymentInstrumentObject);
    describe('Payment-setDefault', function () {
        it('should set and return default payment method', function () {
            var defaultUUID = 'ID1';
            var result = paymentHelpers.setDefault(getPaymentCollection(true, false), defaultUUID);
            assert.equal(result, paymentInstrumentObject);
        });
    });

    describe('Payment-getDefault', function () {
        it('should get and return default payment method', function () {
            var result = paymentHelpers.getDefault(getPaymentCollection(true, false));
            assert.equal(result, paymentInstrumentObject);
        });

        it('should return null when no default mehtod is present', function () {
            var result = paymentHelpers.getDefault(getPaymentCollection(false, false));
            assert.isNull(result);
        });
    });

    describe('Payment-nextDefault', function () {
        it('should get and return the next default payment method', function () {
            var nextDefaultPaymentInstrument = {
                UUID: 'ID2',
                giftCertificateCode: 'someString',
                maskedGiftCertificateCode: 'some masked string',
                paymentMethod: 'GIFT_CERTIFICATE',
                paymentTransaction: {
                    amount: {
                        value: 0
                    }
                },
                custom: {
                    defaultPaymentMethod: false
                }
            };
            var result = paymentHelpers.nextDefault(getPaymentCollection(true, false));
            assert.deepEqual(result, nextDefaultPaymentInstrument);
        });
    });
});
