'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('giftCardHelpers in app_capri_core', function () {
    var Constant = require('app_capri_core/cartridge/config/constants.js');
    var giftcardAmountsStub = sinon.stub();
    var giftcardLimitMinStub = sinon.stub();
    var giftcardLimitMaxstub = sinon.stub();
    var mockForm = {
        amount: {},
        message: {},
        from: {},
        recipient: {},
        recipientEmail: {},
        confirmRecipientEmail: {},
        clear: function () {
            return { };
        }
    };
    var giftCardHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/giftCardHelpers', {
        '*/cartridge/config/giftcardConfiguration.js': {
            giftcardAmounts: giftcardAmountsStub,
            giftcardLimitMin: giftcardLimitMinStub,
            giftcardLimitMax: giftcardLimitMaxstub

        },
        '*/cartridge/config/constants': Constant,
        'server': {
            forms: {
                getForm: function () {
                    return mockForm;
                }
            }
        }
    });
    var mockRequestPLI = {
        custom: {
            giftCardMessage: 'mockMessage',
            giftCardFrom: 'mockFromValues',
            giftCardRecipient: 'mockGiftCardRecipient',
            giftCardRecipientEmail: 'mockGiftCardRecipientEmail'
        },
        price: {
            value: 'mockValue'
        }
    };
    var mockGcType = 'virtual';
    var mockGcType1 = 'mock';
    giftcardAmountsStub.returns(3);
    giftcardLimitMinStub.returns(1);
    giftcardLimitMaxstub.returns(5);

    it('should not return gcOrderForm values when gcType is not virtual', function () {
        var result = giftCardHelpers.getGiftCardDetails(mockRequestPLI, mockGcType1);
        assert.equal(result.gcOrderForm.message.value, undefined);
        assert.equal(result.gcOrderForm.from.value, undefined);
        assert.equal(result.gcOrderForm.recipient.value, undefined);
        assert.equal(result.gcOrderForm.recipientEmail.value, undefined);
        assert.equal(result.gcOrderForm.confirmRecipientEmail.value, undefined);
        assert.equal(result.gcOrderForm.amount.value, 'mockValue');
        assert.equal(result.amounts, 3);
        assert.equal(result.gcMinLimit, 1);
        assert.equal(result.gcMaxLimit, 5);
    });

    it('should return gcOrderForm values when gcType is virtual', function () {
        var result = giftCardHelpers.getGiftCardDetails(mockRequestPLI, mockGcType);
        assert.equal(result.gcOrderForm.message.value, 'mockMessage');
        assert.equal(result.gcOrderForm.from.value, 'mockFromValues');
        assert.equal(result.gcOrderForm.recipient.value, 'mockGiftCardRecipient');
        assert.equal(result.gcOrderForm.recipientEmail.value, 'mockGiftCardRecipientEmail');
        assert.equal(result.gcOrderForm.confirmRecipientEmail.value, 'mockGiftCardRecipientEmail');
        assert.equal(result.gcOrderForm.amount.value, 'mockValue');
        assert.equal(result.amounts, 3);
        assert.equal(result.gcMinLimit, 1);
        assert.equal(result.gcMaxLimit, 5);
    });
});
