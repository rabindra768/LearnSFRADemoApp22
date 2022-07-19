'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var productSetHeadings = proxyquire('app_capri_core/cartridge/models/product/decorators/productSetHeadings', {});
var mockObject = {};
var mockApiProduct = {
    custom: {
        productSetInThisBundle: 'mockProductSetInThisBundle',
        productSetShopThisBundle: 'mockProductSetShopThisBundle',
        michael_kors_brand_name: 'mockBrandName'

    }
};
describe('Decorators- productSetHeadings', function () {
    it('should set the value of productSetInThisBundle', function () {
        productSetHeadings(mockObject, mockApiProduct);
        assert.equal(mockObject.productSetInThisBundle, 'mockProductSetInThisBundle');
    });
    it('should set the value of productSetShopThisBundle', function () {
        productSetHeadings(mockObject, mockApiProduct);
        assert.equal(mockObject.productSetShopThisBundle, 'mockProductSetShopThisBundle');
    });
    it('should set the value of michael_kors_brand_name', function () {
        productSetHeadings(mockObject, mockApiProduct);
        assert.equal(mockObject.michael_kors_brand_name, 'mockBrandName');
    });
});
