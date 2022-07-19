'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var formattedMoney = '₪moolah';

describe('DefaultPrice model', function () {
    var DefaultPrice = proxyquire('app_capri_core/cartridge/models/price/default.js', {
        'dw/value/Money': function () {},
        'dw/util/StringUtils': {
            formatMoney: function () { return formattedMoney; }
        }
    });

    var salesPrice;
    var listPrice;
    var decimalValue = 'decimalValue';
    var noDecimalPrice = 'noDecimalValue';
    var currencyCode = 'ABC';
    var defaultPrice;

    function getDecimalValue() {
        return {
            get: function () {
                return decimalValue;
            }
        };
    }
    function getCurrencyCode() {
        return currencyCode;
    }

    beforeEach(function () {
        salesPrice = {
            available: true,
            getDecimalValue: getDecimalValue,
            getCurrencyCode: getCurrencyCode,
            value: {
                toString: function () {
                    return noDecimalPrice;
                }
            }
        };

        listPrice = {
            available: true,
            getDecimalValue: getDecimalValue,
            getCurrencyCode: getCurrencyCode,
            value: {
                toString: function () {
                    return noDecimalPrice;
                }
            }
        };
    });

    it('should have a sales price', function () {
        defaultPrice = new DefaultPrice(salesPrice);

        assert.deepEqual(defaultPrice, {
            list: null,
            sales: {
                currency: currencyCode,
                formatted: formattedMoney,
                value: decimalValue,
                decimalPrice: '[object Object]',
                noDecimalPrice: 'noDecimalValue',
                noDecimalFormattedPrice: formattedMoney
            }
        });
    });

    it('should set property values to null if price is not available', function () {
        salesPrice.available = false;
        defaultPrice = new DefaultPrice(salesPrice);
        assert.deepEqual(defaultPrice, {
            list: null,
            sales: {
                currency: null,
                formatted: null,
                value: null,
                decimalPrice: undefined,
                noDecimalPrice: undefined,
                noDecimalFormattedPrice: null
            }
        });
    });

    it('should set list price when provided', function () {
        defaultPrice = new DefaultPrice(salesPrice, listPrice);
        assert.deepEqual(defaultPrice, {
            list: {
                currency: currencyCode,
                formatted: formattedMoney,
                value: decimalValue,
                decimalPrice: '[object Object]',
                noDecimalPrice: 'noDecimalValue',
                noDecimalFormattedPrice: formattedMoney
            },
            sales: {
                currency: currencyCode,
                formatted: formattedMoney,
                value: decimalValue,
                decimalPrice: '[object Object]',
                noDecimalPrice: 'noDecimalValue',
                noDecimalFormattedPrice: formattedMoney
            }
        });
    });
});
