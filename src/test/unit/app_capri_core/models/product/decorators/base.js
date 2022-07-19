'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var productModelMock = {
    custom: {
        h1Name: 'some name'
    }
};


var mockSuperModule = require('../../../../../mocks/modules/mockModuleSuperModule');
var basedecorators = require('../../../../../../cartridges/app_storefront_base/cartridge/models/product/decorators/base');
mockSuperModule.create(basedecorators);

var base = proxyquire('../../../../../../cartridges/app_capri_core/cartridge/models/product/decorators/base', {});
describe('product base decorator', function () {
    it('should create h1name property for passed in object', function () {
        var object = {};
        base(object, productModelMock, 'variant');
        assert.equal(object.h1Name, 'some name');
    });
    it('should set the value of masterId when variant is true', function () {
        var object = {};
        productModelMock = {
            variant: true,
            variationModel: { master: { ID: '45678' } },
            custom: {
                h1Name: 'some name'
            }
        };
        base(object, productModelMock, 'variant');
        assert.equal(object.masterID, '45678');
    });

    it('should set the value of masterId when variant is false', function () {
        var object = {};
        productModelMock = {
            variant: false,
            variationModel: { master: { ID: '45678' } },
            ID: '1234',
            custom: {
                h1Name: 'some name'
            }
        };
        base(object, productModelMock, 'variant');
        assert.equal(object.masterID, '1234');
    });
});
