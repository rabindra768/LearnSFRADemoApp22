'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var decorators = require('../../../../mocks/productDecoratorsMock');
decorators.base = sinon.stub();
decorators.price = sinon.stub();
decorators.images = sinon.stub();
decorators.ratings = sinon.stub();
decorators.variantUrl = sinon.stub();
decorators.setProductsCollection = sinon.stub();
decorators.searchSliceVariationAttributes = sinon.stub();
decorators.setIndividualProductsPrice = sinon.stub();
decorators.productSetHeadings = sinon.stub();
decorators.setPrice = sinon.stub();
var priceFactory = sinon.stub();
function baseProductTileAjax() {}
mockSuperModule.create(baseProductTileAjax);
var productMock = {};
var object = {};
var options1 = {
    variationModel: true,
    productType: 'set'
};
var options2 = {
    variationModel: false,
    productType: 'set'
};

var productTileAjax = proxyquire('app_capri_core/cartridge/models/product/productTileAjax', {
    '*/cartridge/models/product/decorators/index': decorators,
    '*/cartridge/scripts/factories/price': priceFactory
});

describe('Product Tile Ajax Model', function () {
    it('should call base for productTileAjax', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.base.called);
    });
    it('should call price for productTileAjax', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.price.called);
    });
    it('should call images for productTileAjax if variationModel is true', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.images.called);
    });
    it('should call images for productTileAjax if variationModel is not true', function () {
        productTileAjax(object, productMock, options2);
        assert.isTrue(decorators.images.called);
    });
    it('should call setProductsCollection for productTileAjax if productType is equal to set', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.setProductsCollection.called);
    });
    it('should call setIndividualProductsPrice for productTileAjax if productType is equal to set', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.setIndividualProductsPrice.called);
    });
    it('should call productSetHeadings for productTileAjax if productType is equal to set', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.productSetHeadings.called);
    });
    it('should call setPrice for productTileAjax if productType is equal to set', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.setPrice.called);
    });
    it('should call ratings for productTileAjax', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.ratings.called);
    });
    it('should call searchSliceVariationAttributes for productTileAjax', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.searchSliceVariationAttributes.called);
    });
    it('should call variantUrl for productTileAjax', function () {
        productTileAjax(object, productMock, options1);
        assert.isTrue(decorators.variantUrl.called);
    });
});

