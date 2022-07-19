'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var Site = {
    getCurrent: sinon.stub()
};
var loopcommerceHelper = proxyquire('int_util/cartridge/scripts/helpers/loopcommerceHelper', {
    'dw/system/Site': Site
});

var ISML = require('dw/template/ISML');
var assert = require('chai').assert;

describe('loopcommerceHelpers', function () {
    describe('renderScripts', function () {
        var spy = sinon.spy(ISML, 'renderTemplate');
        afterEach(function () {
            spy.reset();
        });
        it('should  not throw an error', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'loopCommerceEnabled') {
                        return true;
                    } else if (a === 'loopCommerceDTMControlled')	{
                        return false;
                    }
                    return true;
                }
            });
            var pdict = {
                action: 'Search-Show'
            };
            loopcommerceHelper.renderScripts(pdict, ISML);
            assert.isTrue(spy.called);
        });
        it('should  not throw an error', function () {
            var pdict = {
                action: 'Product-Show'
            };
            loopcommerceHelper.renderScripts(pdict, ISML);
            assert.isTrue(spy.called);
        });
        it('should throw an error', function () {
            var Spy = sinon.spy(require('dw/system/Logger'), 'info');
            loopcommerceHelper.renderScripts(null);
            assert.isTrue(Spy.calledOnce);
        });

        it('should return false if loopCommerceDTMControlled is enabled and script cannot be rendered', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'loopCommerceEnabled') {
                        return true;
                    } else if (a === 'loopCommerceDTMControlled')	{
                        return true;
                    }
                    return true;
                }
            });
            var pdict = {
                action: 'Product-Show'
            };
            loopcommerceHelper.renderScripts(pdict, ISML);
            assert.isFalse(spy.called);
        });
    });
});
