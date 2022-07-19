'use strict';
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var readyToOrder = require('app_capri_core/cartridge/models/product/decorators/readyToOrder');

describe('readyToOrder decorator', function () {
    var mockObject;
    function getMockObject(productInStock) {
        var mockObj = {
            variationAttributes: [{ id: 'color', values: [{ selected: true, inStock: productInStock }] }]
        };
        return mockObj;
    }
    var mockVariationModel = {
        selectedVariant: false
    };

    it('readyToOrder should return true when selected variation product is in stock', function () {
        mockObject = getMockObject(true);
        readyToOrder(mockObject, mockVariationModel);
        assert.isTrue(mockObject.readyToOrder);
    });

    it('readyToOrder should return true when a non-selected variation product is in stock', function () {
        var mockVariationModel1 = {
            selectedVariant: true
        };
        mockObject = getMockObject(false);
        readyToOrder(mockObject, mockVariationModel1);
        assert.isTrue(mockObject.readyToOrder);
    });

    it('readyToOrder should return false when all the variation products are not in stocks', function () {
        mockObject = getMockObject(false);
        readyToOrder(mockObject, mockVariationModel);
        assert.isFalse(mockObject.readyToOrder);
    });
});

