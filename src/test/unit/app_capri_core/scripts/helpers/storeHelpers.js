'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');


var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseStoreHelpers = require('../../../../mocks/helpers/storeHelpers');
mockSuperModule.create(baseStoreHelpers);

var collections = {
    first: sinon.stub()
};

describe('storeHelpers in app_capri_core', function () {
    var storeHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/storeHelpers', {
        '*/cartridge/config/ConfigMgr': {
            getConstants: function () {
                return {
                    UNIT_OF_MEASURE: 3,
                    UNIT_OF_DISTANCE: 4
                };
            }
        },
        'dw/catalog/StoreMgr': {
            searchStoresByPostalCode: function () {
                return {
                    entrySet: function () {
                    }
                };
            }
        },
        '*/cartridge/scripts/util/collections': collections,
        'dw/util/Locale': {
            getLocale: function () {
                return {
                    country: 'US'
                };
            }
        }
    });
    describe('getNearestStore', function () {
        var postalCode = '018013';
        var store = {
            key: {
                ID: 'storeID'
            }
        };
        var store2 = null;

        it('should return store ID when a store is available', function () {
            collections.first.returns(store);
            var storeObject = storeHelpers.getNearestStore(postalCode);
            assert.equal(storeObject, 'storeID');
        });

        it('should return store ID when store is not available for the given postal code', function () {
            collections.first.returns(store2);
            var storeObject = storeHelpers.getNearestStore(postalCode);
            assert.equal(storeObject, null);
        });
    });
});
