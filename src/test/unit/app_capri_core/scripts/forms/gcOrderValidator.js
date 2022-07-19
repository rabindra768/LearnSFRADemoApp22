'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');

describe('gcOrderValidator script in app_capri_core', function () {
    var giftCardConfig = {
        giftcardLimitMin: function () {
            return 100;
        },
        giftcardLimitMax: function () {
            return 200;
        }
    };
    var spyFormElementValidationResult = sinon.spy();
    var Resource = {
        msgf: function () {
            return 'Enter valid amount';
        },
        msg: function () {
            return 'Does not match the card recipient email';
        }
    };
    var gcOrderValidator = proxyquire('app_capri_core/cartridge/scripts/forms/gcOrderValidator', {
        '*/cartridge/config/giftcardConfiguration.js': giftCardConfig,
        'dw/web/FormElementValidationResult': spyFormElementValidationResult,
        'dw/web/Resource': Resource
    });

    describe('validateAmount function', function () {
        var mockFormField = {
            value: 0
        };
        var mockFormField1 = {
            getHtmlName: function () {
                return 'mock Name';
            }
        };
        afterEach(function () {
            spyFormElementValidationResult.reset();
        });

        it('should instantiate FormElementValidationResult with false and error message when amount is lesser than giftcard minimum limit', function () {
            mockFormField.value = 99;
            gcOrderValidator.validateAmount(mockFormField);
            assert.isTrue(spyFormElementValidationResult.calledWith(false, 'Enter valid amount'));
        });
        it('should instantiate FormElementValidationResult with false and error message when amount is greater than giftcard maximum limit', function () {
            mockFormField.value = 201;
            gcOrderValidator.validateAmount(mockFormField);
            assert.isTrue(spyFormElementValidationResult.calledWith(false, 'Enter valid amount'));
        });
        it('should instantiate FormElementValidationResult with true when amount is greater than giftcard minimum limit and lesser than maximum limit', function () {
            mockFormField.value = 101;
            gcOrderValidator.validateAmount(mockFormField);
            assert.isTrue(spyFormElementValidationResult.calledWith(true));
        });
        it('should instantiate FormElementValidationResult with true when giftCardConfig has some error', function () {
            var gcOrderValidator1 = proxyquire('app_capri_core/cartridge/scripts/forms/gcOrderValidator', {
                '*/cartridge/config/giftcardConfiguration.js': {},
                'dw/web/FormElementValidationResult': spyFormElementValidationResult
            });
            gcOrderValidator1.validateAmount(mockFormField1);
            assert.isTrue(spyFormElementValidationResult.calledWith(true));
        });
    });

    describe('validateGiftForm function', function () {
        var mockForm = {
            recipientEmail: {
                value: {
                    toLowerCase: function () {
                        return 'abc@gmail.com';
                    }
                }
            },
            confirmRecipientEmail: {
                value: {
                    toLowerCase: function () {
                        return 'xyz@gmail.com';
                    }
                },
                invalidateFormElement: sinon.spy()
            }
        };
        afterEach(function () {
            mockForm.confirmRecipientEmail.invalidateFormElement.reset();
            spyFormElementValidationResult.reset();
        });
        it('should instantiate invalidateFormElement with error message when recipientEmail and confirm email is different', function () {
            gcOrderValidator.validateGiftForm(mockForm);
            assert.isTrue(mockForm.confirmRecipientEmail.invalidateFormElement.calledWith('Does not match the card recipient email'));
            assert.isTrue(spyFormElementValidationResult.calledWith(true));
        });
        it('should not instantiate invalidateFormElement with error message when recipientEmail and confirm email is same', function () {
            mockForm.confirmRecipientEmail.value.toLowerCase = function () {
                return 'abc@gmail.com';
            };
            gcOrderValidator.validateGiftForm(mockForm);
            assert.isFalse(mockForm.confirmRecipientEmail.invalidateFormElement.calledWith('Does not match the card recipient email'));
        });
        it('should instantiate FormElementValidationResult with true when form is null', function () {
            gcOrderValidator.validateGiftForm(null);
            assert.isFalse(mockForm.confirmRecipientEmail.invalidateFormElement.calledWith('Does not match the card recipient email'));
            assert.isTrue(spyFormElementValidationResult.calledWith(true));
        });
    });
});
