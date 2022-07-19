'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var pricingHelper = {
    getIndividualProductsPrices: function () { return '$10'; }
};
var mockObject = {};
var mockApiProduct = {};
var mockUseSimplePrice = {};
var mockFactory = {};

var setIndividualProductsPrice = proxyquire('app_capri_core/cartridge/models/product/decorators/setIndividualProductsPrice', {
    '*/cartridge/scripts/helpers/pricing': pricingHelper
});

describe('setIndividualProductsPrice decorator in app_capri_core', function () {
    it('should return individualProducts Price ', function () {
        setIndividualProductsPrice(mockObject, mockApiProduct, mockUseSimplePrice, mockFactory);
        assert.equal(mockObject.individualProducts, '$10');
    });
});

