'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var baseStore = require('../../../mocks/models/store');
mockSuperModule.create(baseStore);
var mockStoreObject = {
    custom: {
        storeURL: 'mockStoreURL'
    }
};
var Store = proxyquire('app_capri_core/cartridge/models/store.js', {});
describe('Model-store', function () {
    it('should return a value for store URL', function () {
        var result = new Store(mockStoreObject);
        assert.equal(result.storeURL, 'mockStoreURL');
    });
});
