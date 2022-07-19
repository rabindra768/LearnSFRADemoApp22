'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var ArrayList = require('../../../mocks/dw.util.Collection');

var PaymentMgr = {
    getPaymentCard: sinon.stub()
};

var mockCurrentCustomer = {
    addressBook: {
        addresses: {},
        preferredAddress: {
            address1: '15 South Point Drive',
            address2: null,
            city: 'Boston',
            countryCode: {
                displayValue: 'United States',
                value: 'US'
            },
            firstName: 'John',
            lastName: 'Snow',
            ID: 'Home',
            postalCode: '02125',
            stateCode: 'MA'
        }
    },
    customer: {},
    profile: {
        firstName: 'John',
        lastName: 'Snow',
        email: 'jsnow@starks.com'
    },
    wallet: {
        paymentInstruments: [
            {
                creditCardHolder: 'John',
                creditCardExpirationMonth: '4',
                creditCardExpirationYear: '2030',
                maskedCreditCardNumber: '***********4215',
                creditCardType: 'Visa',
                paymentMethod: 'CREDIT_CARD',
                raw: {
                    custom: {
                        defaultPaymentMethod: true
                    },
                    creditCardExpired: false
                }
            },
            {
                creditCardHolder: 'Tom',
                creditCardExpirationMonth: '4',
                creditCardExpirationYear: '2021',
                maskedCreditCardNumber: '***********1111',
                creditCardType: 'Amex',
                paymentMethod: 'CREDIT_CARD',
                raw: {
                    custom: {
                        defaultPaymentMethod: false
                    },
                    creditCardExpired: true
                }
            }
        ]
    },
    raw: {
        authenticated: true,
        registered: true
    }
};

var mockCurrentCustomer2 = {
    addressBook: {
        addresses: [
            {
                filter: function () {},
                address1: '15 South Point Drive',
                address2: null,
                city: 'Boston',
                countryCode: {
                    displayValue: 'United States',
                    value: 'US'
                },
                firstName: 'John',
                lastName: 'Snow',
                ID: 'Home',
                postalCode: '02125',
                stateCode: 'MA'
            }
        ]
    },
    raw: {
        authenticated: true,
        registered: true
    }
};

var mockAddressModel = {
    address: {
        address1: '15 South Point Drive',
        address2: null,
        city: 'Boston',
        countryCode: {
            displayValue: 'United States',
            value: 'US'
        },
        firstName: 'John',
        lastName: 'Snow',
        ID: 'Home',
        postalCode: '02125',
        stateCode: 'MA'
    }
};

var mockOrderModel = {
    orderNumber: '00000204',
    orderStatus: {
        displayValue: 'NEW'
    },
    creationDate: 'some Date',
    shippedToFirstName: 'John',
    shippedToLastName: 'Snow',
    shipping: {
        shippingAddress: {
            address1: '15 South Point Drive',
            address2: null,
            city: 'Boston',
            countryCode: {
                displayValue: 'United States',
                value: 'US'
            },
            firstName: 'John',
            lastName: 'Snow',
            ID: 'Home',
            phone: '123-123-1234',
            postalCode: '02125',
            stateCode: 'MA'
        }
    },
    items: new ArrayList([
        {
            product: {
                getImage: function () {
                    return {
                        URL: {
                            relative: function () {
                                return 'Some String';
                            }
                        }
                    };
                }
            }
        }
    ]),
    priceTotal: 125.99,
    totals: {
        grandTotal: 125.99
    },
    productQuantityTotal: 3
};

var baseAddressModel = require('../../../mocks/models/address');
var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var baseAccount = proxyquire('app_storefront_base/cartridge/models/account', {
    '*/cartridge/models/address': baseAddressModel
});
mockSuperModule.create(baseAccount);

var Locale = {
    getLocale: sinon.stub()
};

Locale.getLocale.returns({
    getCountry: function () {
        return 'US';
    }
});

PaymentMgr.getPaymentCard.returns({
    verify: function () {
        return {
            code: 'OK'
        };
    }
});

describe('account model in app_capri_core', function () {
    var AccountModel = proxyquire('app_capri_core/cartridge/models/account', {
        'dw/order/PaymentMgr': PaymentMgr,
        'dw/util/Locale': Locale
    });
    var result;
    describe('should receive an account with customer profile, order history and payment instruments', function () {
        it('should return customer payment instruments', function () {
            result = new AccountModel(mockCurrentCustomer, mockAddressModel, mockOrderModel);
            assert.equal(result.customerPaymentInstruments.length, 2);
            assert.equal(result.customerPaymentInstruments[0].creditCardType, 'Visa');
            assert.equal(result.customerPaymentInstruments[0].lastFourDigits, '4215');
            assert.equal(result.customerPaymentInstruments[0].cardTypeImage.src, '/on/demandware.static/relative/url/to/resource');
            assert.equal(result.customerPaymentInstruments[0].cardTypeImage.alt, 'Visa');
            assert.equal(result.customerPaymentInstruments[0].creditCardExpirationMonth, '4');
            assert.equal(result.customerPaymentInstruments[0].creditCardExpirationYear, '2030');
            assert.equal(result.customerPaymentInstruments[0].savedcreditCardStatus, 'OK');
            assert.equal(result.customerPaymentInstruments[0].creditCardHolder, 'John');
            // checking whether the card is default or not
            assert.isTrue(result.customerPaymentInstruments[0].default);
            assert.isFalse(result.customerPaymentInstruments[0].expired);
        });

        it('Checking status for expired credit card', function () {
            PaymentMgr.getPaymentCard.returns({
                verify: function () {
                    return {
                        code: 'CREDITCARD_EXPIRED'
                    };
                }
            });
            result = new AccountModel(mockCurrentCustomer, mockAddressModel, mockOrderModel);
            assert.equal(result.customerPaymentInstruments[1].creditCardType, 'Amex');
            assert.equal(result.customerPaymentInstruments[1].creditCardExpirationMonth, '4');
            assert.equal(result.customerPaymentInstruments[1].creditCardExpirationYear, '2021');
            assert.equal(result.customerPaymentInstruments[1].savedcreditCardStatus, 'CREDITCARD_EXPIRED');
            assert.isTrue(result.customerPaymentInstruments[1].expired);
            assert.isFalse(result.customerPaymentInstruments[1].default);
        });

        it('should return customer profile', function () {
            result = new AccountModel(mockCurrentCustomer, mockAddressModel, mockOrderModel);
            assert.equal(result.profile.email, 'jsnow@starks.com');
            assert.equal(result.profile.firstName, 'John');
            assert.equal(result.profile.lastName, 'Snow');
        });
        it('should return order history', function () {
            result = new AccountModel(mockCurrentCustomer, mockAddressModel, mockOrderModel);
            assert.equal(result.orderHistory.orderNumber, '00000204');
            assert.equal(result.orderHistory.creationDate, 'some Date');
        });
        it('should return addresses & applicableShippingAddressbyCountry as empty array', function () {
            result = new AccountModel(mockCurrentCustomer, mockAddressModel, mockOrderModel);
            assert.equal(result.addresses.length, 0);
            assert.equal(result.applicableShippingAddressbyCountry.length, 0);
        });
    });

    describe('should receive addresses and applicableShippingAddressbyCountry', function () {
        it('should return addresses & applicableShippingAddressbyCountry', function () {
            result = new AccountModel(mockCurrentCustomer2, mockAddressModel, mockOrderModel);
            assert.equal(result.addresses.length, 1);
            assert.equal(result.addresses[0].address1, '15 South Point Drive');
            assert.equal(result.applicableShippingAddressbyCountry.length, 1);
            assert.equal(result.applicableShippingAddressbyCountry[0].ID, 'Home');
        });
        it('should return order history, profile & payment as null', function () {
            result = new AccountModel(mockCurrentCustomer2, null, null);
            assert.equal(result.orderHistory, null);
            assert.equal(result.payment, null);
            assert.equal(result.profile, null);
            assert.equal(result.customerPaymentInstruments, null);
        });
    });
});
