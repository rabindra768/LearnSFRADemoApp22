/* eslint-disable space-in-parens */
/* eslint-disable no-unused-vars */
/* eslint-disable no-redeclare */
'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');
var giftCardDetails = proxyquire('app_capri_core/cartridge/models/productLineItem/decorators/giftCardDetails', {});
var mocklineItem1 = {};

var mocklineItem = {
    custom: {
        giftCardFrom: 'mockgiftCardForm',
        giftCardRecipient: 'mockgiftCardRecipient',
        giftCardMessage: 'mockgiftCardMessage',
        giftCardRecipientEmail: 'mockgiftCardRecipientEmail'
    }
};
var mocklineItem1 = {
    custom: {
        giftCardFrom: null,
        giftCardRecipient: null,
        giftCardMessage: null,
        giftCardRecipientEmail: null
    }
};
var mockproduct;
describe('giftCardDetails', function () {
    beforeEach(function () { mockproduct = {}; } );
    it('should check the value of mocklineItem property', function () {
        giftCardDetails(mockproduct, mocklineItem);
        assert.deepEqual(mockproduct.giftCardDetails, mocklineItem.custom);
    });
    it('should check with null value for mocklineItem1 property', function () {
        giftCardDetails(mockproduct, mocklineItem1);
        assert.isNull(mockproduct.giftCardDetails.giftCardFrom);
        assert.isNull(mockproduct.giftCardDetails.giftCardRecipient);
        assert.isNull(mockproduct.giftCardDetails.giftCardMessage);
        assert.isNull(mockproduct.giftCardDetails.giftCardRecipientEmail);
    });
});
