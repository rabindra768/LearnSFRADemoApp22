'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var COHelpers = {
    validateCustomerForm: sinon.stub()
};

COHelpers.validateCustomerForm.returns({
    formFieldErrors: {
        length: 1,
        error: 'mock error'
    },
    customerForm: {
        clear: function () {}
    }
});

var toString = function () {};
var URLUtils = {
    url: function () {
        return toString;
    }
};

var currentBasket = {
    setCustomerEmail: sinon.spy(),
    shipments: {
        length: 1
    }
};

var BasketMgr = {
    getCurrentBasket: sinon.stub()
};

var Locale = {
    getLocale: function () {
        return {
            country: 'US'
        };
    }
};

var OrderModel = function () {};
var checkoutServiceHelpers = proxyquire('app_capri_core/cartridge/scripts/checkout/checkoutServiceHelpers', {
    '*/cartridge/scripts/checkout/checkoutHelpers': COHelpers,
    '*/cartridge/models/order': OrderModel,
    'dw/web/URLUtils': URLUtils,
    'dw/order/BasketMgr': BasketMgr,
    'dw/util/Locale': Locale
});
var customerData = {
    customer: {
        email: {
            value: 'mock@gmail.com'
        }
    },
    csrfToken: 'mock Token'
};

describe('checkoutServiceHelpers', function () {
    var form = {
    };
    var res = {
        getViewData: function () {
            return customerData;
        },
        json: sinon.spy()
    };
    var req = {
        session: {
            privacyCache: {
                get: sinon.stub(),
                set: sinon.spy()
            }
        },
        locale: {
            id: 'US'
        }
    };
    req.session.privacyCache.get.returns(true);
    var result;

    describe('validateCustomerForm function', function () {
        it('should return error message & error status if the customer form has some field errors', function () {
            result = checkoutServiceHelpers.validateCustomerForm(form);
            assert.isTrue(result.json.error);
            assert.equal(result.json.fieldErrors.error, 'mock error');
        });

        it('should return customer email when there is no field error in customer form', function () {
            COHelpers.validateCustomerForm.returns({
                viewData: {
                    customer: {
                        email: 'mock@gmail.com'
                    }
                },
                formFieldErrors: {
                    length: 0
                }
            });
            result = checkoutServiceHelpers.validateCustomerForm(form);
            assert.equal(result.viewData.customer.email, 'mock@gmail.com');
        });
    });

    describe('handleCustomerRouteBeforeComplete function', function () {
        afterEach(function () {
            res.json.reset();
            req.session.privacyCache.set.reset();
            currentBasket.setCustomerEmail.reset();
        });

        it('should not set customer email in SFCC if currentBasket is empty', function () {
            BasketMgr.getCurrentBasket.returns(null);
            result = checkoutServiceHelpers.handleCustomerRouteBeforeComplete(req, res, {}, '');
            assert.isFalse(currentBasket.setCustomerEmail.called);
            assert.isUndefined(result);
            assert.isTrue(res.json.calledOnce);
        });

        it('should set customer email in SFCC if currentBasket is not empty', function () {
            BasketMgr.getCurrentBasket.returns(currentBasket);
            checkoutServiceHelpers.handleCustomerRouteBeforeComplete(req, res, {}, '');
            assert.isTrue(currentBasket.setCustomerEmail.called);
            assert.isTrue(req.session.privacyCache.set.calledOnce);
            assert.isTrue(res.json.calledOnce);
        });

        it('should not set privacy cache for session if usingMultiShipping having false value', function () {
            req.session.privacyCache.get.returns(false);
            checkoutServiceHelpers.handleCustomerRouteBeforeComplete(req, res, {}, '');
            assert.isFalse(req.session.privacyCache.set.calledOnce);
        });
    });
});
