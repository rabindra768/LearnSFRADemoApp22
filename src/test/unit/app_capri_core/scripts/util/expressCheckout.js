'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var Site = require('dw-api-mock/dw/system/Site');
var site = Site.getCurrent();

describe('expressCheckout util in app_capri_core', function () {
    var expressCheckout = proxyquire('app_capri_core/cartridge/scripts/util/expressCheckout', {
        'dw/system/Site': {
            getCurrent: function () {
                return site;
            }
        }
    });
    site.setCustomPreferenceValue('expressCheckoutEnabled', true);
    var result;
    describe('Cart - checkoutoption', function () {
        it('should return expessCheckoutObject', function () {
            result = expressCheckout.expressCheckout('Cart');
            assert.deepEqual(result, {
                isApplePayEnabled: false,
                isPaypalEnabled: false,
                isAppleSticky: false,
                isPayPalSticky: false
            });
        });
        it('should return isApplePayEnabled & isAppleSticky as true', function () {
            site.setCustomPreferenceValue('expressCheckoutApplePay', true);
            site.setCustomPreferenceValue('expressCheckoutApplePayCart', true);
            site.setCustomPreferenceValue('expressCheckoutApplePayStickyCart', true);
            result = expressCheckout.expressCheckout('Cart');
            assert.equal(result.isApplePayEnabled, true);
            assert.equal(result.isAppleSticky, true);
        });
        it('should return isPaypalEnabled & isPayPalSticky as true', function () {
            site.setCustomPreferenceValue('expressCheckoutPayPal', true);
            site.setCustomPreferenceValue('expressCheckoutPayPalCart', true);
            site.setCustomPreferenceValue('expressCheckoutPaypalStickyCart', true);
            result = expressCheckout.expressCheckout('Cart');
            assert.equal(result.isPaypalEnabled, true);
            assert.equal(result.isPayPalSticky, true);
        });
    });
    describe('MiniCart - checkoutoption', function () {
        it('should return expressCheckoutObject for minicart', function () {
            site.setCustomPreferenceValue('expressCheckoutApplePayMiniBag', true);
            site.setCustomPreferenceValue('expressCheckoutPayPalMiniBag', true);
            result = expressCheckout.expressCheckout('MiniCart');
            assert.deepEqual(result, {
                isApplePayEnabled: true,
                isPaypalEnabled: true,
                isAppleSticky: true,
                isPayPalSticky: true
            });
        });
    });
    it('should return empty object if checkoutoption is neither Cart nor MiniCart', function () {
        result = expressCheckout.expressCheckout('');
        assert.deepEqual(result, {});
    });
});
