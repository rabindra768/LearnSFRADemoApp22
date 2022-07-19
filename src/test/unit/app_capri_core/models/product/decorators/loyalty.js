'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var Site = {
    getCurrent: sinon.stub()
};
var productMock = {
    custom: {
        isEligibleforLoyalty: true
    }
};
var productMock1 = {
    custom: {
        isEligibleforLoyalty: false
    }
};
function getObject(selectedQuantity, minOrderQuantity, salePrice) {
    var objectMock = {
        selectedQuantity: selectedQuantity,
        minOrderQuantity: minOrderQuantity,
        price: {
            sales: {
                value: salePrice
            }
        }
    };
    return objectMock;
}
var loyalty = proxyquire('app_capri_core/cartridge/models/product/decorators/loyalty', { 'dw/system/Site': Site });

describe('Loyalty Decorator', function () {
    var object;
    before(function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'isLoyaltyEnabled') {
                    return true;
                } else if (a === 'loyaltyPointRatio') {
                    return 10;
                }
                return false;
            }
        });
    });
    it('Should "isLoyaltyEnabled" returns true when product is eligible for loyalty', function () {
        object = getObject(3, 1, 10);
        loyalty(object, productMock);
        assert.equal(object.isLoyaltyEnabled, true);
    });
    it('Should "isLoyaltyEnabled" returns false when product is not eligible for loyalty', function () {
        object = getObject(5, 2, 10);
        loyalty(object, productMock1);
        assert.equal(object.isLoyaltyEnabled, false);
    });
    it('Should returns loyaltyPoints for selected quantity', function () {
        object = getObject(10, 1, 10);
        loyalty(object, productMock);
        expect(object.loyaltyPoints).equal(1000);
    });
    it('Should returns loyaltyPoints for minimum quantity when quantity is not selected by user', function () {
        object = getObject(0, 1, 10);
        loyalty(object, productMock);
        expect(object.loyaltyPoints).equal(100);
    });
    it('Should loyaltyPoints be 0 when productSellingPrice is null', function () {
        object = getObject(2, 1, null);
        loyalty(object, productMock);
        expect(object.loyaltyPoints).equal(0);
    });
    it('Should loyaltyPoints be 0 when quantity is null', function () {
        object = getObject(0, null, 10);
        loyalty(object, productMock);
        expect(object.loyaltyPoints).equal(0);
    });
    it('Should loyaltyPoints be 0 when loyaltyPointRatio is null', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'isLoyaltyEnabled') {
                    return true;
                } else if (a === 'loyaltyPointRatio') {
                    return 0;
                }
                return false;
            }
        });
        object = getObject(3, 1, 10);
        loyalty(object, productMock);
        expect(object.loyaltyPoints).equal(0);
    });
});
