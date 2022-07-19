'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var decorators = require('../../../../mocks/productDecoratorsMock');
decorators.base = sinon.stub();
decorators.availability = sinon.stub();
decorators.capriAttributes = sinon.stub();
decorators.quantity = sinon.stub();
decorators.variationAttributes = sinon.stub();
decorators.readyToOrder = sinon.stub();

var productMock = {
    attributeModel: {},
    minOrderQuantity: { value: 'someValue' },
    availabilityModel: {},
    stepQuantity: { value: 'someOtherValue' },
    getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; },
    getMasterProduct: function () {
        return {
            getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; }
        };
    },
    ID: 'someID',
    pageTitle: 'some title',
    pageDescription: 'some description',
    pageKeywords: 'some keywords',
    pageMetaData: [{}],
    template: 'some template'
};

var optionsMock = {
    productType: 'someProductType',
    optionModel: {},
    quantity: 1,
    variationModel: true,
    promotions: [],
    variables: []
};

var lightProduct = proxyquire('app_capri_core/cartridge/models/product/lightProduct', {
    '*/cartridge/models/product/decorators/index': decorators
});

describe('Light Product Model', function () {
    it('should call base for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.base.called);
    });

    it('should call availability for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.availability.called);
    });

    it('should call capriAttributes for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.capriAttributes.called);
    });

    it('should call quantity for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.quantity.called);
    });

    it('should call variationAttributes for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.variationAttributes.called);
    });

    it('should call readyToOrder for product', function () {
        var object = {};
        lightProduct(object, productMock, optionsMock);
        assert.isTrue(decorators.readyToOrder.called);
    });
});
