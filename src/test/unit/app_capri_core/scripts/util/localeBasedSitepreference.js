'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var sinon = require('sinon');
var Site = require('dw-api-mock/dw/system/Site');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var Logger = {
    error: function () {
        return 'Error State';
    }
};
var Locale = {
    getLocale: sinon.stub()
};

var site = Site.getCurrent();

describe('localeBasedSitepreference script', function () {
    var localeBasedSitePreference = proxyquire('app_capri_core/cartridge/scripts/util/localeBasedSitepreference', {
        'dw/system/Logger': Logger,
        'dw/util/Locale': Locale,
        'dw/system/Site': {
            getCurrent: function () {
                return site;
            }
        }
    });

    describe('getToggleBasedOnCountryCode - function ', function () {
        beforeEach(function () {
            Locale.getLocale.returns({
                getCountry: function () {
                    return 'US';
                }
            });
        });

        it('should return isEnabled as true', function () {
            site.setCustomPreferenceValue('mockPreference', ['US', 'CA']);
            var result = localeBasedSitePreference.getToggleBasedOnCountryCode('mockPreference');
            assert.isTrue(result);
        });

        it('should return isEnabled as false', function () {
            site.setCustomPreferenceValue('mockPreference', ['GB', 'FR']);
            var result = localeBasedSitePreference.getToggleBasedOnCountryCode('mockPreference');
            assert.isFalse(result);
        });
    });

    describe('getToggleBasedOnLocale - function ', function () {
        beforeEach(function () {
            Locale.getLocale.returns({
                ID: 'en_US'
            });
        });

        it('should return isEnabled as true', function () {
            site.setCustomPreferenceValue('mockPreference', ['en_US', 'en_CA']);
            var result = localeBasedSitePreference.getToggleBasedOnLocale('mockPreference');
            assert.isTrue(result);
        });

        it('should return isEnabled as false', function () {
            site.setCustomPreferenceValue('mockPreference', ['fr_FR', 'en_GB']);
            var result = localeBasedSitePreference.getToggleBasedOnLocale('mockPreference');
            assert.isFalse(result);
        });
    });

    describe('getPreferenceBasedOnCountryJson - function ', function () {
        beforeEach(function () {
            Locale.getLocale.returns({
                getCountry: function () {
                    return 'US';
                }
            });
        });

        it('should return null when site preference is empty', function () {
            var result = localeBasedSitePreference.getPreferenceBasedOnCountryJson();
            assert.isNull(result);
        });

        it('should return null when site preference is not set', function () {
            site.setCustomPreferenceValue('mockPreference', null);
            var result = localeBasedSitePreference.getPreferenceBasedOnCountryJson('mockPreference');
            assert.isNull(result);
        });

        it('should return return the value for the country code set in the site preference', function () {
            site.setCustomPreferenceValue('mockPreference', '{"US":"067347"}');
            var result = localeBasedSitePreference.getPreferenceBasedOnCountryJson('mockPreference');
            assert.equal(result, '067347');
        });

        it('should return null country code is empty', function () {
            Locale.getLocale.returns({
                getCountry: function () {
                    return '';
                }
            });
            site.setCustomPreferenceValue('mockPreference', '{"US":"067347"}');
            var result = localeBasedSitePreference.getPreferenceBasedOnCountryJson('mockPreference');
            assert.isNull(result);
        });

        it('should return null when there is an error in parsing the JSON', function () {
            Locale.getLocale.returns({
                getCountry: function () {
                    return '';
                }
            });
            site.setCustomPreferenceValue('mockPreference', { US: '067347' });
            var result = localeBasedSitePreference.getPreferenceBasedOnCountryJson('mockPreference');
            assert.isNull(result);
        });
    });
});
