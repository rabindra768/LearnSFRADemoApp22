'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var pricingHelper = {
    getSetPrice: sinon.stub()
};
var setPrice = proxyquire('app_capri_core/cartridge/models/product/decorators/setPrice', {
    '*/cartridge/scripts/helpers/pricing': pricingHelper
});
var mockObject = {
    individualProducts: 'mockIndividualProducts'
};
describe('Decorators- setPrice', function () {
    it('should return setPrice for the products', function () {
        pricingHelper.getSetPrice.returns('$25');
        setPrice(mockObject);
        assert.equal(mockObject.setPrice, '$25');
    });
});
