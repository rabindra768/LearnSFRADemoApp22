'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var expect = require('chai').expect;
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('crmProxy in app_capri_core', function () {
    var baseAbstractSubject = require('app_capri_core/cartridge/scripts/proxies/subject/crmSubject');
    var ProxyConfigMgr = proxyquire('app_capri_core/cartridge/scripts/proxies/ProxyConfigMgr', {
        '*/cartridge/scripts/proxies/subject/crmSubject': baseAbstractSubject
    });

    var crmProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/crmProxy', {
        '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
    });

    it('check whether all the function in crmProxy present in base crmsubject as well', function () {
        Object.keys(crmProxy).forEach(function (prop) {
            expect(baseAbstractSubject).to.have.property(prop);
        });
    });

    it('should return create customer success status as true', function () {
        assert.isTrue(crmProxy.createCustomer().success);
    });

    it('should return search customer success status as true', function () {
        assert.isTrue(crmProxy.searchCustomer().success);
    });

    it('should return enroll marketingEmail success status as true', function () {
        assert.isTrue(crmProxy.enrollMarketingEmail().success);
    });

    it('should return update customer success status as true', function () {
        assert.isTrue(crmProxy.updateCustomer().success);
    });

    it('should return update customerAddress success status as true', function () {
        assert.isTrue(crmProxy.updateCustomerAddress().success);
    });

    it('isEnabled function should return true', function () {
        var ProxyConfigMgr1 = {
            getCartridgePathBasedActiveSubject: function () {
                return {
                    getID: function () {},
                    isEnabled: function () {
                        return true;
                    }
                };
            }
        };
        var crmProxy1 = proxyquire('app_capri_core/cartridge/scripts/proxies/crmProxy',
            {
                '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr1
            });
        assert.isTrue(crmProxy1.isEnabled());
    });
});
