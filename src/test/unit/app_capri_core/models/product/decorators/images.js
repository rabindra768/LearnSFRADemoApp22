'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../../../mocks/dw.util.Collection');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var productMock = {
    getImages: function () {
        return new ArrayList([]);
    }
};

describe('images decorator in app_capri_core', function () {
    var collections = proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
        'dw/util/ArrayList': ArrayList
    });

    var imagesModel = proxyquire('app_storefront_base/cartridge/models/product/productImages', {
        '*/cartridge/scripts/util/collections': collections
    });

    var images = proxyquire('app_capri_core/cartridge/models/product/decorators/images', {
        '*/cartridge/models/product/productImages': imagesModel
    });

    it('should create a property on the passed in object called images', function () {
        var objectMock = {};
        var configMock = {
            types: ['large', 'small'],
            quantity: 'all'
        };
        images(objectMock, productMock, configMock);

        assert.equal(objectMock.images.large.length, 0);
        assert.equal(objectMock.images.small.length, 0);
    });
});

