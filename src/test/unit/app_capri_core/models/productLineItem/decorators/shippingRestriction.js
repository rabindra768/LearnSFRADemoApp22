'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var Resource = {
    msg: sinon.stub()
};

var shippingRestriction = proxyquire('app_capri_core/cartridge/models/productLineItem/decorators/shippingRestriction', {
    'dw/web/Resource': Resource });

function getApiProductMock(hazmatValue) {
    var apiProductMock = {
        custom: {
            is_product_hazmat: hazmatValue
        }
    };
    return apiProductMock;
}

var objectMock;

describe('Product line item shipping restrictions decorator', function () {
    beforeEach(function () {
        objectMock = {
            isProductHazmat: null,
            shippingRestrictionMg: null
        };
        Resource.msg.returns('Mock Hazmat Message');
    });
    it('Should return null when hazmat value is null', function () {
        var apiProductMock = getApiProductMock(false);
        shippingRestriction(objectMock, apiProductMock);
        assert.isFalse(objectMock.shippingRestriction.isProductHazmat);
        assert.isUndefined(objectMock.shippingRestriction.shippingRestrictionMg);
    });

    it('Should return hazmat message when hazmat value is true', function () {
        var apiProductMock = getApiProductMock(true);
        var message = 'Mock Hazmat Message';
        shippingRestriction(objectMock, apiProductMock);
        assert.isTrue(objectMock.shippingRestriction.isProductHazmat);
        assert.equal(objectMock.shippingRestriction.shippingRestrictionMg, message);
    });
});
