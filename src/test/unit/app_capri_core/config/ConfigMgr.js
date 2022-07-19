'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

require('dw-api-mock/demandware-globals');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var preferences;

function getStubs(siteId, locale) {
    global.request.locale = locale;
    let Site = {
        getCurrent: function () {
            return {
                getID: function () { return siteId; }
            };
        }
    };
    let sitePreferences = {
        siteID: siteId,
        localeTest: 'ValueFromLocaleSite'
    };

    let localePreferences = {
        locale: locale,
        localeTest: 'ValueFromLocale'
    };

    var stubs = {
        '*/cartridge/config/preferences': preferences,
        'dw/system/Site': Site
    };
    stubs['*/cartridge/config/preferences/preferences_' + siteId] = sitePreferences;
    stubs['*/cartridge/config/preferences/preferences_' + locale] = localePreferences;
    return stubs;
}

function getConfigMgr(stubs) {
    return proxyquire('app_capri_core/cartridge/config/ConfigMgr', stubs);
}

describe('ConfigMgr', function () {
    describe('getPreferences', function () {
        before(function () {
            let mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
            let preferencesBase = require('app_storefront_base/cartridge/config/preferences');
            mockSuperModule.create(preferencesBase);
            preferences = proxyquire('app_capri_core/cartridge/config/preferences', {});
        });
        describe('getPreferences for site mk_us and locale en_US', function () {
            let finalPreferences;
            it('Should get preferences for site mk_us and locale en_US', function () {
                let stubs = getStubs('mk_us', 'en_US');
                let configMgr = getConfigMgr(stubs);
                finalPreferences = configMgr.getPreferences();
                assert.isObject(finalPreferences, 'preferences is an object');
            });
            it('Should pick site level preferences value when not configured in global and locale preferences', function () {
                expect(finalPreferences).to.have.property('siteID');
                assert.equal(finalPreferences.siteID, 'mk_us');
            });
            it('Should pick locale level preferences value when not configured in site and global preferences ', function () {
                expect(finalPreferences).to.have.property('locale');
                assert.equal(finalPreferences.locale, 'en_US');
            });
            it('Should override attributes based on locale preferences, when site and locale has the same attribute', function () {
                expect(finalPreferences).to.have.property('localeTest');
                assert.equal(finalPreferences.localeTest, 'ValueFromLocale');
            });
            it('Should pick global preference when site and locale does not have this attribute', function () {
                expect(finalPreferences).to.have.property('maxOrderQty');
                assert.equal(finalPreferences.maxOrderQty, 10);
            });
            it('Should set plpBackButtonOn to false', function () {
                expect(finalPreferences).to.have.property('plpBackButtonOn');
                assert.equal(preferences.plpBackButtonOn, false);
            });
            it('Should set miniBagFlyOutTimeinMilliSec to some milli seconds', function () {
                assert.deepEqual(preferences.miniBagFlyOutTimeinMilliSec, 4000);
            });
            it('accountNaviLinks should be an array with following values', function () {
                var navLinks = ['profile',
                    'payments',
                    'addresses',
                    'myorders',
                    'favorites',
                    'logout',
                    'loyalty'
                ];
                expect(preferences.accountNaviLinks).to.be.an('array');
                expect(preferences.accountNaviLinks).to.include.members(navLinks);
            });
            it('accountLeftNaviLinks should be an array with following values', function () {
                var accountLeftNaviLinks = [
                    'myaccount',
                    'addresses',
                    'payments',
                    'myorders',
                    'favorites',
                    'loyalty'
                ];
                expect(preferences.accountLeftNaviLinks).to.be.an('array');
                expect(preferences.accountLeftNaviLinks).to.include.members(accountLeftNaviLinks);
            });
        });
        describe('getPreferences for site mk_ca and locale en_CA', function () {
            let finalPreferences;
            it('Should get preferences for site mk_ca and locale en_CA', function () {
                let stubs = getStubs('mk_ca', 'en_CA');
                let configMgr = getConfigMgr(stubs);
                finalPreferences = configMgr.getPreferences();
            });
            it('Should pick site level preferences value when not configured in global and locale preferences', function () {
                expect(finalPreferences).to.have.property('siteID');
                assert.equal(finalPreferences.siteID, 'mk_ca');
            });
            it('Should pick locale level preferences value when not configured in site and global preferences', function () {
                expect(finalPreferences).to.have.property('locale');
                assert.equal(finalPreferences.locale, 'en_CA');
            });
            it('Should override attributes based on locale preferences, when site and locale has the same attribute ', function () {
                expect(finalPreferences).to.have.property('localeTest');
                assert.equal(finalPreferences.localeTest, 'ValueFromLocale');
            });
        });
    });
    describe('getConstants', function () {
        var constants;
        var configMgr;
        before(function () {
            var capriCoreConstants = require('app_capri_core/cartridge/config/constants');
            configMgr = proxyquire('app_capri_core/cartridge/config/ConfigMgr', {
                '*/cartridge/config/constants': capriCoreConstants
            });
            constants = configMgr.getConstants();
        });
        it('Should contain property HOME and value Home-Show', function () {
            expect(constants).to.have.property('HOME');
            assert.equal(constants.HOME, 'Home-Show');
        });
        it('Should contain property CHANNEL and value online', function () {
            expect(constants).to.have.property('CHANNEL');
            assert.equal(constants.CHANNEL, 'online');
        });
        it('Should contain property REQUESTTYPE and value Reservation', function () {
            expect(constants).to.have.property('REQUESTTYPE');
            assert.equal(constants.REQUESTTYPE, 'Reservation');
        });
        it('Should contain property STRATEGYTYPE and value CompleteMultiSource', function () {
            expect(constants).to.have.property('STRATEGYTYPE');
            assert.equal(constants.STRATEGYTYPE, 'CompleteMultiSource');
        });
        it('Should contain property DEMANDTYPE and value Allocation', function () {
            expect(constants).to.have.property('DEMANDTYPE');
            assert.equal(constants.DEMANDTYPE, 'Allocation');
        });
    });
});
