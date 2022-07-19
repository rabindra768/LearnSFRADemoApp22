'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var Money = require('../../../mocks/dw.value.Money');
var ArrayList = require('../../../mocks/dw.util.Collection');
var mockCollections = require('../../../mocks/util/collections');
var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var baseTotals = require('../../../mocks/models/totals');
mockSuperModule.create(baseTotals);

describe('Totals model', function () {
    var Resource = {
        msg: function (label) {
            if (label === 'label.cart.freeshippingcost') {
                return 'FREE';
            } else if (label === 'label.cart.hyphen') {
                return '--';
            }
            return '';
        }
    };
    var currencyCode = 'ABC';

    var Totals = proxyquire('app_capri_core/cartridge/models/totals', {
        'dw/web/Resource': Resource,
        'dw/util/StringUtils': {
            formatMoney: function () {
                return 'formatted money';
            }
        },
        'dw/value/Money': Money,
        '*/cartridge/scripts/util/collections': mockCollections,
        'dw/utilCurrency': currencyCode,
        '*/cartridge/scripts/cart/cartHelpers': {
            getGiftwrapTotals: function () {}
        }
    });

    var result;
    var createApiBasket = {
        totalGrossPrice: new Money(false),
        totalTax: {
            available: false,
            value: 0,
            getDecimalValue: function () { return '0'; },
            getCurrencyCode: function () { return 'USD'; },
            subtract: function () { return new Money(false); }
        },
        shippingTotalPrice: {
            available: false,
            value: 0,
            getDecimalValue: function () { return '0'; },
            getCurrencyCode: function () { return 'USD'; },
            subtract: function () { return new Money(false); }
        },
        getAdjustedMerchandizeTotalPrice: function () {
            return new Money(false);
        },
        getCurrencyCode: function () {
            return 'USD';
        },
        adjustedShippingTotalPrice: new Money(false),
        couponLineItems: new ArrayList([
            {
                UUID: 1234567890,
                couponCode: 'some coupon code',
                applied: true,
                valid: true,
                priceAdjustments: new ArrayList([{
                    promotion: { calloutMsg: 'some call out message' }
                }])
            }
        ]),
        priceAdjustments: new ArrayList([{
            UUID: 10987654321,
            calloutMsg: 'some call out message',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString',
            promotion: { calloutMsg: 'some call out message' }
        },
        {
            UUID: 10987654322,
            calloutMsg: 'price adjustment without promotion msg',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString'
        }]),
        allShippingPriceAdjustments: new ArrayList([{
            UUID: 12029384756,
            calloutMsg: 'some call out message',
            basedOnCoupon: false,
            price: { value: 'some value', currencyCode: 'usd' },
            lineItemText: 'someString',
            promotion: { calloutMsg: 'some call out message' }
        }])
    };
    it('should return shipping cost as "Free" when shipping cost is $0 or Free', function () {
        result = new Totals(createApiBasket);
        assert.equal(result.totalShippingCost, 'FREE');
    });

    it('should return total tax as "--" when the tax equals 0 or cannot be calculated', function () {
        result = new Totals(createApiBasket);
        assert.equal(result.totalTax, '--');
    });
});

