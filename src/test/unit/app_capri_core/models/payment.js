'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../mocks/dw.util.Collection');
var collections = require('../../../mocks/util/collections');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var URLUtils = require('../../../mocks/dw.web.URLUtils');

var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var basePayment = require('../../../mocks/models/payment');
mockSuperModule.create(basePayment);

var paymentHelper = {
    filterApplicablePaymentMethods: sinon.stub()
};

var PaymentModel = proxyquire('app_capri_core/cartridge/models/payment', {
    'dw/web/URLUtils': URLUtils,
    '*/cartridge/scripts/util/collections': collections,
    '*/cartridge/scripts/helpers/paymentHelpers': paymentHelper
});

var paymentMethods = new ArrayList([
    {
        ID: 'GIFT_CERTIFICATE',
        name: 'Gift Certificate'
    },
    {
        ID: 'CREDIT_CARD',
        name: 'Credit Card'
    }
]);

var paymentInstruments = new ArrayList([
    {
        creditCardNumberLastDigits: '1111',
        creditCardHolder: 'The Muffin Man',
        creditCardExpirationYear: 2018,
        creditCardType: 'Visa',
        maskedCreditCardNumber: '************1111',
        paymentMethod: 'CREDIT_CARD',
        creditCardExpirationMonth: 1,
        paymentTransaction: {
            amount: {
                value: 0
            }
        }
    },
    {
        giftCertificateCode: 'someString',
        maskedGiftCertificateCode: 'some masked string',
        paymentMethod: 'GIFT_CERTIFICATE',
        paymentTransaction: {
            amount: {
                value: 0
            }
        }
    }
]);

function createApiBasket(options) {
    var basket = {
        totalGrossPrice: {
            value: 'some value'
        }
    };

    if (options && options.paymentMethods) {
        basket.paymentMethods = options.paymentMethods;
    }

    if (options && options.paymentCards) {
        basket.paymentCards = options.paymentCards;
    }

    if (options && options.paymentInstruments) {
        basket.paymentInstruments = options.paymentInstruments;
    }

    return basket;
}

describe('Payment model', function () {
    paymentHelper.filterApplicablePaymentMethods.returns(paymentMethods);
    it('Should return the payment card object', function () {
        new PaymentModel(createApiBasket({ paymentInstruments: paymentInstruments }), null);
        var paymentInstrumentObject = {
            UUID: 'Some ID',
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
                defaultPaymentMethod: 'CREDIT_CARD'
            }
        };
        var result = PaymentModel.paymentObject(paymentInstrumentObject);
        assert.equal(result.UUID, 'Some ID');
        assert.equal(result.creditCardHolder, 'The Muffin Man');
        assert.equal(result.maskedCreditCardNumber, '************1111');
        assert.equal(result.creditCardType, 'Visa');
        assert.equal(result.creditCardExpirationMonth, 1);
        assert.equal(result.creditCardExpirationYear, 2024);
        assert.isFalse(result.expired);
        assert.equal(result.default, 'CREDIT_CARD');
        assert.equal(result.cardTypeImage.src, 'some url');
        assert.equal(result.cardTypeImage.alt, 'Visa');
    });
});
