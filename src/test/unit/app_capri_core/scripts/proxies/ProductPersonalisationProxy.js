'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var expect = require('chai').expect;
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('productPersonalisationProxy in app_capri_core', function () {
    var baseAbstractSubject = require('app_capri_core/cartridge/scripts/proxies/subject/productPersonalisationSubject');

    var ProxyConfigMgr = proxyquire('app_capri_core/cartridge/scripts/proxies/ProxyConfigMgr', {
        '*/cartridge/scripts/proxies/subject/productPersonalisationSubject': baseAbstractSubject
    });

    var ProductPersonalisationProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/ProductPersonalisationProxy', {
        '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
    });

    it('check whether all the function in productPersonalisationProxy present in base productPersonalisationProxy as well', function () {
        Object.keys(ProductPersonalisationProxy).forEach(function (prop) {
            expect(baseAbstractSubject).to.have.property(prop);
        });
    });

    it('isPersonalisationEnabledForProduct function should return false', function () {
        assert.isFalse(ProductPersonalisationProxy.isPersonalisationEnabledForProduct());
    });

    it('isEnabled function should return false', function () {
        assert.isFalse(ProductPersonalisationProxy.isEnabled());
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

        var ProductPersonalisationProxy1 = proxyquire('app_capri_core/cartridge/scripts/proxies/ProductPersonalisationProxy', {
            '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr1
        });
        assert.isTrue(ProductPersonalisationProxy1.isEnabled());
    });
});
