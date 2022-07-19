'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var decorators = require('../../../../mocks/productDecoratorsMock');
decorators.base = sinon.stub();
decorators.searchPrice = sinon.stub();
decorators.images = sinon.stub();
decorators.ratings = sinon.stub();
decorators.setProductsCollection = sinon.stub();
decorators.searchVariationAttributes = sinon.stub();
decorators.setIndividualProductsPrice = sinon.stub();
decorators.productSetHeadings = sinon.stub();
decorators.setPrice = sinon.stub();
decorators.searchSliceVariationAttributes = sinon.stub();
decorators.variantUrl = sinon.stub();
decorators.promotions = sinon.stub();
var productHelperMock = {
    getProductSearchHit: sinon.stub()
};
var promotionCacheMock = {
    promotions: true
};
var priceFactory = sinon.stub();
var pricingHelper = {
    getPromotions: sinon.stub()
};
function baseProductTile() {}
mockSuperModule.create(baseProductTile);

productHelperMock.getProductSearchHit.returns(1);
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
var object = {};
var productTypeMock1 = 'set';
var productTypeMock2 = 'variant';
var productTypeMock3 = '';
var productTile = proxyquire('app_capri_core/cartridge/models/product/productTile', {
    '*/cartridge/models/product/decorators/index': decorators,
    '*/cartridge/scripts/util/promotionCache': promotionCacheMock,
    '*/cartridge/scripts/helpers/productHelpers': productHelperMock,
    '*/cartridge/scripts/factories/price': priceFactory,
    '*/cartridge/scripts/helpers/pricing': pricingHelper
});

describe('Product Tile Model', function () {
    it('should call base for product Tile', function () {
        productTile(object, productMock, productTypeMock1);
        assert.isTrue(decorators.base.called);
    });

    it('should call searchPrice for product Tile', function () {
        productTile(object, productMock, productTypeMock1);
        assert.isTrue(decorators.searchPrice.called);
    });

    it('should call images for product Tile', function () {
        productTile(object, productMock, productTypeMock1);
        assert.isTrue(decorators.images.called);
    });

    it('should call ratings for product Tile', function () {
        productTile(object, productMock, productTypeMock1);
        assert.isTrue(decorators.ratings.called);
    });

    it('should call promotions for product Tile', function () {
        productTile(object, productMock, productTypeMock1);
        assert.isTrue(decorators.promotions.called);
    });

    describe('When productType is set', function () {
        it('should call setProductsCollection for product Tile', function () {
            productTile(object, productMock, productTypeMock1);
            assert.isTrue(decorators.setProductsCollection.called);
        });

        it('should call setIndividualProductsPrice for product Tile', function () {
            productTile(object, productMock, productTypeMock1);
            assert.isTrue(decorators.setIndividualProductsPrice.called);
        });

        it('should call productSetHeadings for product Tile', function () {
            productTile(object, productMock, productTypeMock1);
            assert.isTrue(decorators.productSetHeadings.called);
        });

        it('should call setPrice for product Tile', function () {
            productTile(object, productMock, productTypeMock1);
            assert.isTrue(decorators.setPrice.called);
        });
    });

    describe('When productType is variant', function () {
        it('should call searchSliceVariationAttributes for product Tile', function () {
            productTile(object, productMock, productTypeMock2);
            assert.isTrue(decorators.searchSliceVariationAttributes.called);
        });

        it('should call variantUrl for product Tile', function () {
            productTile(object, productMock, productTypeMock2);
            assert.isTrue(decorators.variantUrl.called);
        });
    });

    it('should call searchVariationAttributes for product Tile', function () {
        productTile(object, productMock, productTypeMock3);
        assert.isTrue(decorators.searchVariationAttributes.called);
    });
});
