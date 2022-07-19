'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var giftCardAttributes = proxyquire('app_capri_core/cartridge/models/product/decorators/giftCardAttributes', {});
var mockObject = {};
var mockApiProduct = {
    custom: {
        is_gift_card: 'mock_is_gift_card',
        gift_card_type: 'mock_gift_card_type'

    }
};
describe('Decorators-giftCardAttributes', function () {
    it('should set the value of is_gift_card', function () {
        giftCardAttributes(mockObject, mockApiProduct);
        assert.equal(mockObject.is_gift_card, 'mock_is_gift_card');
    });
    it('should set the value of gift_card_type', function () {
        giftCardAttributes(mockObject, mockApiProduct);
        assert.equal(mockObject.gift_card_type, 'mock_gift_card_type');
    });
});
