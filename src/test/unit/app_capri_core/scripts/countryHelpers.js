'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('countryHelpers util', function () {
    var BasketMgr = {
        getCurrentBasket: sinon.stub()
    };
    BasketMgr.getCurrentBasket.returns(null); // initially checking for currentCustomer only
    var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
    var countryHelpers = proxyquire('app_capri_core/cartridge/scripts/countryHelpers', {
        'dw/order/BasketMgr': BasketMgr
    });
    it('should return true by if currentCustomer is not null', function () {
        var req = {
            currentCustomer: {
                profile: {
                    email: 'abc@test.com'
                }
            }
        };
        assert.isNotNull(countryHelpers.isShowConfirmationPopup(req));
    });

    it('should return true by if currentCustomer authenticated', function () {
        var req = {
            currentCustomer: {
                raw: {
                    authenticated: true
                }
            }
        };
        assert.isTrue(countryHelpers.isShowConfirmationPopup(req));
    });

    it('should return true by if currentCustomer registered', function () {
        var req = {
            currentCustomer: {
                raw: {
                    registered: true
                }
            }
        };
        assert.isTrue(countryHelpers.isShowConfirmationPopup(req));
    });

    it('should return true by if current basket is not null & basket has products', function () {
        var req = {};  // currentCustomer is null here
        var currentBasket = {
            function() {
                return 'someCartProduct';
            },
            allProductLineItems: {
                empty: false
            }
        };
        BasketMgr.getCurrentBasket.returns(currentBasket);
        assert.isNotNull(countryHelpers.currentBasket);
        assert.isTrue(countryHelpers.isShowConfirmationPopup(req));
    });
});
