'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var decorators = require('../../../../mocks/productDecoratorsMock');
decorators.loyalty = sinon.stub();
decorators.capriAttributes = sinon.stub();
decorators.images = sinon.stub();
decorators.price = sinon.stub();
decorators.quantity = sinon.stub();
decorators.variationModel = sinon.stub();
decorators.description = sinon.stub();
decorators.ratings = sinon.stub();
decorators.promotions = sinon.stub();
decorators.attributes = sinon.stub();
decorators.availability = sinon.stub();
decorators.options = sinon.stub();
decorators.quantitySelector = sinon.stub();
decorators.sizeChart = sinon.stub();
decorators.currentUrl = sinon.stub();
decorators.readyToOrder = sinon.stub();
decorators.online = sinon.stub();
decorators.raw = sinon.stub();
decorators.pageMetaData = sinon.stub();
decorators.template = sinon.stub();
decorators.base = sinon.stub();
decorators.variationAttributes = sinon.stub();
decorators.availableForInStorePickup = sinon.stub();
decorators.giftCardAttributes = sinon.stub();

function baseFullProduct() {}
mockSuperModule.create(baseFullProduct);

var productMock = {
    attributeModel: {},
    minOrderQuantity: { value: 'someValue' },
    availabilityModel: {},
    stepQuantity: { value: 'someOtherValue' },
    getPrimaryCategory: function () {},
    getMasterProduct: function () {
        return {
            getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; }
        };
    },
    custom: {
        sizeChartID: 'someID'
    },
    ID: 'someID',
    pageTitle: 'some title',
    pageDescription: 'some description',
    pageKeywords: 'some keywords',
    pageMetaData: [{}],
    template: 'some template'
};

var optionsMock1 = {
    productType: 'variationGroup',
    optionModel: {},
    quantity: 1,
    variationModel: true,
    promotions: [],
    variables: []
};

var optionsMock2 = {
    productType: 'someProductType',
    optionModel: {},
    quantity: 1,
    variationModel: false,
    promotions: [],
    variables: []
};

var fullProduct = proxyquire('app_capri_core/cartridge/models/product/fullProduct', {
    '*/cartridge/models/product/decorators/index': decorators
});

describe('Full Product Model', function () {
    var object = {};
    beforeEach(function () {
        object = {};
    });
    it('should call loyalty for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.loyalty.called);
    });

    it('should call capriAttributes for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.capriAttributes.called);
    });

    it('should call images for full product when variation model is true', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.images.called);
    });

    it('should call images for full product when variation model is false', function () {
        fullProduct(object, productMock, optionsMock2);
        assert.isTrue(decorators.images.called);
    });

    it('should call price for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.price.called);
    });

    it('should call quantity for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.quantity.called);
    });

    it('should call variationAttributes for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.variationAttributes.called);
    });

    it('should call description for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.description.called);
    });

    it('should call ratings for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.ratings.called);
    });

    it('should call promotions for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.promotions.called);
    });

    it('should call attributes for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.attributes.called);
    });

    it('should call availability for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.availability.called);
    });

    it('should call options for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.options.called);
    });

    it('should call quantitySelector for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.quantitySelector.called);
    });

    it('should call currentUrl for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.currentUrl.called);
    });

    it('should call readyToOrder for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.readyToOrder.called);
    });

    it('should call online for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.online.called);
    });

    it('should call raw for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.raw.called);
    });

    it('should call pageMetaData for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.pageMetaData.called);
    });

    it('should call template for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.template.called);
    });

    it('should call availableForInStorePickup for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.availableForInStorePickup.called);
    });

    it('should call giftCardAttributes for full product', function () {
        fullProduct(object, productMock, optionsMock1);
        assert.isTrue(decorators.giftCardAttributes.called);
    });
});
