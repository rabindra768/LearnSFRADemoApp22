'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var expect = require('chai').expect;
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('LoyaltyProxy in app_capri_core', function () {
    var baseAbstractSubject = require('app_capri_core/cartridge/scripts/proxies/subject/loyaltySubject');

    var ProxyConfigMgr = proxyquire('app_capri_core/cartridge/scripts/proxies/ProxyConfigMgr', {
        '*/cartridge/scripts/proxies/subject/loyaltySubject': baseAbstractSubject
    });

    var LoyaltyProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/LoyaltyProxy', {
        '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
    });

    it('check whether all the function in LoyaltyProxy present in base loyaltysubject as well', function () {
        Object.keys(LoyaltyProxy).forEach(function (prop) {
            expect(baseAbstractSubject).to.have.property(prop);
        });
    });

    it('getLoyaltyAndSetProfileAttributes function should return true', function () {
        assert.isTrue(LoyaltyProxy.getLoyaltyAndSetProfileAttributes());
    });

    it('should return getOrderConfirmLoyaltyData().isEnabled as false', function () {
        assert.isFalse(LoyaltyProxy.getOrderConfirmLoyaltyData().isEnabled);
    });

    it('enrollLoyalty function should return true', function () {
        assert.isTrue(LoyaltyProxy.enrollLoyalty());
    });

    it('should return getLoyaltyEventHistory as []', function () {
        var result = LoyaltyProxy.getLoyaltyEventHistory();
        assert.isArray(result);
        assert.equal(result.length, 0);
    });

    it('should return getLoyaltyStatusPoints as []', function () {
        var result = LoyaltyProxy.getLoyaltyStatusPoints();
        assert.isArray(result);
        assert.equal(result.length, 0);
    });

    it('isEnabled function should return true', function () {
        var ProxyConfigMgr1 = {
            getCartridgePathBasedActiveSubject: function () {
                return {
                    isEnabled: function () {
                        return true;
                    }
                };
            }
        };

        var LoyaltyProxy1 = proxyquire('app_capri_core/cartridge/scripts/proxies/LoyaltyProxy', {
            '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr1
        });

        assert.isTrue(LoyaltyProxy1.isEnabled());
    });
});
