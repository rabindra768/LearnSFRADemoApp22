'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var expect = require('chai').expect;
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('geoLocationProxy in app_capri_core', function () {
    var baseAbstractSubject = require('app_capri_core/cartridge/scripts/proxies/subject/geoLocationSubject');

    var ProxyConfigMgr = proxyquire('app_capri_core/cartridge/scripts/proxies/ProxyConfigMgr', {
        '*/cartridge/scripts/proxies/subject/geoLocationSubject': baseAbstractSubject
    });
    var geoLocationProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/geoLocationProxy', {
        '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
    });

    it('check whether all the function in geoLocationProxy present in base activeSubject as well', function () {
        Object.keys(geoLocationProxy).forEach(function (prop) {
            expect(baseAbstractSubject).to.have.property(prop);
        });
    });

    it('geoLocationProxy function should return Object', function () {
        assert.isObject(geoLocationProxy.getGeoLocationCoordinates());
    });


    it('getGeoLocationCoordinates function should return false', function () {
        ProxyConfigMgr = {
            getCartridgePathBasedActiveSubject: function () {
                return false;
            }
        };
        geoLocationProxy = proxyquire('app_capri_core/cartridge/scripts/proxies/geoLocationProxy', {
            '*/cartridge/scripts/proxies/ProxyConfigMgr': ProxyConfigMgr
        });
        assert.isObject(geoLocationProxy.getGeoLocationCoordinates());
    });
});
