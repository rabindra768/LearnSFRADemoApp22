'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var decorators = require('../../../../mocks/productDecoratorsMock');

decorators.base = sinon.spy();
decorators.setPrice = sinon.spy();
decorators.productSetHeadings = sinon.spy();

function baseProductSet() {}
mockSuperModule.create(baseProductSet);

var productMock = {
    attributeModel: {},
    minOrderQuantity: { value: 'someValue' },
    availabilityModel: {},
    stepQuantity: {
        value: 'someOtherValue'
    },
    getPrimaryCategory: function () {
        return { custom: {
            sizeChartID: 'someID'
        }
        };
    },
    getMasterProduct: function () {
        return {
            getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; }
        };
    },
    getVariationModel: function () {
        return 'variation model';
    },
    ID: 'someID'
};
var optionsMock = {};
var factoryMock = {};
var object = {};

var productSet = proxyquire('app_capri_core/cartridge/models/product/productSet', {
    '*/cartridge/models/product/decorators/index': decorators
});

describe('Product Set Model', function () {
    it('should call base for product Set', function () {
        productSet(object, productMock, optionsMock, factoryMock);
        assert.isTrue(decorators.base.called);
    });

    it('should call setPrice for product Set', function () {
        productSet(object, productMock);
        assert.isTrue(decorators.setPrice.called);
    });

    it('should call productSetHeadings for product Set', function () {
        productSet(object, productMock);
        assert.isTrue(decorators.productSetHeadings.called);
    });
});
