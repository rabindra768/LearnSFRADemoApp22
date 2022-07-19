'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var expect = require('chai').expect;
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('OMSProxy in app_capri_core', function () {
    var baseAbstractSubject = require('app_capri_core/cartridge/scripts/proxies/subject/OMSSubject');

    var ProxyConfigMgr = proxyquire('app_capri_core/cartridge/scripts/proxies/ProxyConfigMgr', {
        '*/cartridge/scripts/proxies/subject/OMSSubject': baseAbstractSubject
    });

    var OMSProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/OMSProxy', {
        '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
    });

    it('check whether all the function in OMSProxy present in base OMSsubject as well', function () {
        Object.keys(OMSProxy).forEach(function (prop) {
            expect(baseAbstractSubject).to.have.property(prop);
        });
    });

    it('getRealTimeStoreInventory function should return Object', function () {
        assert.isObject(OMSProxy.getRealTimeStoreInventory());
    });

    it('getRealTimeInventory function should return Object', function () {
        assert.isObject(OMSProxy.getRealTimeInventory());
    });

    it('reserveInventory function should return Object', function () {
        assert.isObject(OMSProxy.reserveInventory());
    });

    it('cancelReservation function should return Object', function () {
        assert.isObject(OMSProxy.cancelReservation());
    });

    it('updateOmsOOSMessages function should not return', function () {
        ProxyConfigMgr = {
            getCartridgePathBasedActiveSubject: function () {
                return false;
            }
        };
        OMSProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/OMSProxy', {
            '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
        });
        assert.equal(OMSProxy.updateOmsOOSMessages(), undefined);
    });
});
