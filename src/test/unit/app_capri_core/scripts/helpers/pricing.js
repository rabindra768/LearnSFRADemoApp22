'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var PromotionMgr = {
    activeCustomerPromotions: {
        getProductPromotions: function () { }
    }
};
var spyDefaultPrice = sinon.spy();
var mockIndividualProducts1 = [
    { price: {
        type: 'range',
        listMax: {
            list: {
                value: 2
            },
            sales: {
                currency: 'US',
                value: 1
            }
        }
    }
    }];
var mockIndividualProducts2 = [
    { price: {
        type: 'range',
        listMax: {
            sales: {
                currency: 'US',
                value: 1
            }
        }
    }
    }];
var mockIndividualProducts3 = [
    { price: {
        type: 'default',
        sales: {
            currency: 'US',
            value: 0
        },
        list: {
            value: 1
        }
    }
    }];
var mockIndividualProducts4 = [
    { price: {
        type: 'default',
        sales: {
            currency: 'US',
            value: 30
        }
    }
    }
];
var mockIndividualProducts5 = [
    { price: {
        type: 'default',
        sales: {
            currency: 'US',
            value: 0
        }
    }
    }
];
var mockApiProduct1 = {
    custom: {}
};
var mockApiProduct2 = {
    custom: {
        productSetPriceOverrideValue: 1
    }
};
var mockObject = {};
var mockApiProduct = {
    bundledProducts: ['someBundledProduct', 'random']
};
var mockUseSimplePrice = false;
var mockFactory = {
    getPrice: function () { return 1; }
};

var money = require('dw-api-mock/dw/value/Money');
const collections = require('../../../../mocks/util/collections');
var pricingHelper = proxyquire('app_capri_core/cartridge/scripts/helpers/pricing', {
    'dw/value/Money': money,
    '*/cartridge/models/price/default': spyDefaultPrice,
    '*/cartridge/scripts/util/collections': collections,
    'dw/campaign/PromotionMgr': PromotionMgr
});
var getCurrencyCode = sinon.stub();
getCurrencyCode.returns('US');
global.session.getCurrency = function () {
    return {
        getCurrencyCode
    };
};
describe('Helpers-pricing in app_capri_core', function () {
    after(function () {
        getCurrencyCode.reset();
    });
    afterEach(function () {
        spyDefaultPrice.reset();
    });
    it('should instantiate defaultPrice with overrided price and null', function () {
        pricingHelper.getSetPrice(null, mockApiProduct2);
        assert.isTrue(spyDefaultPrice.calledWith({ currencyCode: 'US', value: 1 }, null));
    });
    describe('When price type range', function () {
        afterEach(function () {
            spyDefaultPrice.reset();
        });
        it('should instantiate defaultPrice  with sales and list price when listMax.list is available', function () {
            pricingHelper.getSetPrice(mockIndividualProducts1, mockApiProduct1);
            assert.isTrue(spyDefaultPrice.calledWith({ currencyCode: 'US', value: 1 }, { currencyCode: 'US', value: 2 }));
        });
        it('should instantiate defaultPrice  with sales price and null  when listMax.list is not available', function () {
            pricingHelper.getSetPrice(mockIndividualProducts2, mockApiProduct1);
            assert.isTrue(spyDefaultPrice.calledWith({ currencyCode: 'US', value: 1 }, null));
        });
    });
    describe('When price type is not range', function () {
        afterEach(function () {
            spyDefaultPrice.reset();
        });
        it('should instantiate defaultPrice  with sales and list price when price.list is available', function () {
            pricingHelper.getSetPrice(mockIndividualProducts3, mockApiProduct1);
            assert.isTrue(spyDefaultPrice.calledWith({ currencyCode: 'US', value: 0 }, { currencyCode: 'US', value: 1 }));
        });
        it('should instantiate defaultPrice  with sales price and null when price.list is not available', function () {
            pricingHelper.getSetPrice(mockIndividualProducts4, mockApiProduct1);
            assert.isTrue(spyDefaultPrice.calledWith({ currencyCode: 'US', value: 30 }, null));
        });
        it('should return an empty object when sales and list price are zero', function () {
            var result = pricingHelper.getSetPrice(mockIndividualProducts5, mockApiProduct1);
            assert.deepEqual(result, {});
        });
    });
    describe('getIndividualProductsPrices function', function () {
        it('should return an array by setting  the values of options.Promotions and price', function () {
            var mockArray = [{ price: 1 }, { price: 1 }];
            var result = pricingHelper.getIndividualProductsPrices(mockObject, mockApiProduct, mockUseSimplePrice, mockFactory);
            assert.deepEqual(result, mockArray);
        });
    });
});
