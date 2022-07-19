'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var ArrayList = require('../../../../../mocks/dw.util.Collection');

var stubRangePrice = sinon.stub();
var stubDefaultPrice = sinon.stub();
var stubListPrices = sinon.stub();


var searchHitMock = {
    minPrice: { value: 100, available: true },
    maxPrice: { value: 100, available: true },
    discountedPromotionIDs: ['someID']
};

var noActivePromotionsMock = [];
var activePromotionsMock = ['someID'];
var activePromotionsNoMatchMock = [];

function getSearchHit() {
    return searchHitMock;
}

describe('search price decorator', function () {
    var searchPrice = proxyquire('app_capri_core/cartridge/models/product/decorators/searchPrice', {
        '*/cartridge/scripts/helpers/pricing': {
            getPromotionPrice: function () { return { value: 50, available: true }; },
            getPromotions: function (searchHit, activePromotions) { return new ArrayList(activePromotions); },
            getListPrices: stubListPrices
        },
        '*/cartridge/models/price/default': stubDefaultPrice,
        '*/cartridge/models/price/range': stubRangePrice
    });

    afterEach(function () {
        stubRangePrice.reset();
        stubDefaultPrice.reset();
        stubListPrices.reset();
    });

    stubListPrices.returns({
        minPrice: { value: 100, available: true },
        maxPrice: { value: 100, available: true }
    });

    it('should create a property on the passed in object called price with no active promotions', function () {
        var object = {};
        searchPrice(object, searchHitMock, noActivePromotionsMock, getSearchHit);
        assert.isTrue(stubDefaultPrice.withArgs({ value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price when there are active promotion but they do not match', function () {
        var object = {};
        searchPrice(object, searchHitMock, activePromotionsNoMatchMock, getSearchHit);
        assert.isTrue(stubDefaultPrice.withArgs({ value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price when there active promotions that do match', function () {
        var object = {};
        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);
        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }, { value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};
        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);
        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        var object = {};
        searchPrice(object, searchHitMock, activePromotionsMock, getSearchHit);
        assert.isTrue(stubDefaultPrice.withArgs({ value: 50, available: true }, { value: 100, available: true }).calledOnce);
    });

    it('should create a property on the passed in object called price', function () {
        searchHitMock.maxPrice.value = 200;
        stubListPrices.returns({
            minPrice: { value: 100, available: true },
            maxPrice: { value: 200, available: true }
        });
        var object = {};
        searchPrice(object, searchHitMock, noActivePromotionsMock, getSearchHit);
        assert.isTrue(stubRangePrice.withArgs({ value: 100, available: true }, { value: 200, available: true }, { value: 100, available: true }, { value: 200, available: true }).calledOnce);
    });
});
