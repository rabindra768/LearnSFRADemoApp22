'use strict';
var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var baseOrder = require('../../../mocks/models/order');
var ArrayList = require('../../../mocks/dw.util.Collection');
mockSuperModule.create(baseOrder);

var optionsMock = {};
var mockCollections = require('../../../mocks/util/collections');

var createApiBasket = function () {
    return {
        getCustomerNo: function () {
            return '00000011';
        },
        getCurrencyCode: function () {
            return 'GBP';
        },
        billingAddress: true,
        defaultShipment: {
            shippingAddress: true
        },
        orderNo: 'some String',
        creationDate: 'some Date',
        customerEmail: 'some Email',
        status: 'some status',
        productQuantityTotal: 1,
        totalGrossPrice: {
            available: true,
            value: 180.00
        },
        totalTax: {
            available: true,
            value: 20.00
        },
        shippingTotalPrice: {
            available: true,
            value: 20.00,
            subtract: function () {
                return {
                    value: 20.00
                };
            }
        },
        discounts: [],
        adjustedShippingTotalPrice: {
            value: 20.00,
            available: true
        },
        shipments: [{
            id: 'me'
        }],

        getAdjustedMerchandizeTotalPrice: function () {
            return {
                subtract: function () {
                    return {
                        value: 100.00
                    };
                },
                value: 140.00,
                available: true
            };
        },
        productLineItems: [{
            length: 2,
            quantity: {
                value: 1
            },

            items: [
                {
                    product: {
                        images: {
                            small: [
                                {
                                    url: 'url to small image',
                                    alt: 'url to small image',
                                    title: 'url to small image'
                                }
                            ]
                        }
                    }
                }

            ]
        }],
        shipping: [{
            shippingAddress: {
                firstName: 'John',
                lastName: 'Snow'
            }
        }],
        getProductLineItems: function () {

        }
    };
};

describe('Order Model', function () {
    var Resources = {
        msgf: function () {
            return 'mock ship to address message';
        }
    };
    var cartHelpers = {
        getEcomAndStoreItemsFromPoductLineItems: sinon.stub(),
        basketHasGiftWrapEligibleProducts: sinon.stub()
    };
    var storeHelpers = {
        getStoreDetailsByStoreId: sinon.stub()
    };
    var Order = proxyquire('app_capri_core/cartridge/models/order', {
        '*/cartridge/scripts/helpers/storeHelpers': storeHelpers,
        '*/cartridge/scripts/cart/cartHelpers': cartHelpers,
        '*/cartridge/scripts/util/collections': mockCollections,
        'dw/web/Resource': Resources
    });
    var basket = createApiBasket();

    cartHelpers.getEcomAndStoreItemsFromPoductLineItems.returns({
        pickupInStoreItems: new ArrayList([{
            bonusProductLineItem: false,
            gift: false,
            UUID: 'some UUID',
            adjustedPrice: {
                value: 'some value',
                currencyCode: 'US'
            },
            quantity: {
                value: 1
            },
            fromStoreId: 'mockID'
        }]),
        noOfStoreItems: 1,
        ecomItems: [{
            bonusProductLineItem: false,
            gift: false,
            UUID: 'some UUID 2',
            adjustedPrice: {
                value: 'some value',
                currencyCode: 'US'
            },
            quantity: {
                value: 1
            }
        }],
        noOfEcomItems: 1
    }
);
    var result;

    it('should identify the number of ecom products', function () {
        result = new Order(basket, optionsMock);
        assert.isNotNull(result.pickupInStoreItems);
        assert.isNotNull(result.ecomItems);
        assert.equal(result.noOfEcomItems, 1);
    });

    it('should return shiptoaddress message', function () {
        assert.equal(result.resources.noOfEcomItems, 'mock ship to address message');
    });

    it('should identify the number of store products', function () {
        assert.equal(result.noOfStoreItems, 1);
    });
});
