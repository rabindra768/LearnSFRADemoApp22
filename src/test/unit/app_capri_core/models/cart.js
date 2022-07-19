'use strict';
var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var shippingHelpers = require('../../../mocks/helpers/shippingHelpers');
var Money = require('../../../mocks/dw.value.Money');
var toProductMock = require('../../../util');
var ArrayList = require('../../../mocks/dw.util.Collection');
var mockCollections = require('../../../mocks/util/collections');
var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');
var baseCart = require('../../../mocks/models/cart');

mockSuperModule.create(baseCart);

describe('cart model', function () {
    var Resource = {
        msgf: function () {
            return 'mock ship to address message';
        }
    };
    var ProductLineItemsModel = {
        pid: 'someID',
        shipmentId: 'shipmentId',
        custom: { fromStoreId: 'storeId',
            shipmentType: 'instore' }
    };
    var cartHelpers = {
        getEcomAndStoreItemsFromPoductLineItems: sinon.stub(),
        basketHasGiftWrapEligibleProducts: sinon.stub()
    };
    var CartModel = proxyquire('app_capri_core/cartridge/models/cart', {
        'dw/web/Resource': Resource,
        '*/cartridge/scripts/checkout/shippingHelpers': shippingHelpers,
        '*/cartridge/scripts/util/collections': mockCollections,
        'dw/util/ArrayList': ArrayList,
        '*/cartridge/models/productLineItems': ProductLineItemsModel,
        '*/cartridge/scripts/cart/cartHelpers': cartHelpers,
        '*/cartridge/scripts/proxies/OMSProxy': {
            updateOmsOOSMessages: function () {
            }
        }
    });

    var result;
    var productVariantMock = {
        ID: '1234567',
        name: 'test product',
        variant: true,
        availabilityModel: {
            isOrderable: {
                return: true,
                type: 'function'
            },
            inventoryRecord: {
                ATS: {
                    value: 100
                }
            }
        },
        minOrderQuantity: {
            value: 2
        }
    };
    var productVariantMock2 = {
        ID: '12345678',
        name: 'test product',
        variant: true,
        fromStoreId: '123',
        availabilityModel: {
            isOrderable: {
                return: true,
                type: 'function'
            },
            inventoryRecord: {
                ATS: {
                    value: 100
                }
            }
        },
        minOrderQuantity: {
            value: 2
        }
    };

    var productMock = {
        variationModel: {
            productVariationAttributes: new ArrayList([{
                attributeID: '',
                value: ''
            }]),
            selectedVariant: productVariantMock
        }
    };
    var productMock2 = {
        variationModel: {
            productVariationAttributes: new ArrayList([{
                attributeID: '',
                value: ''
            }]),
            selectedVariant: productVariantMock2
        }
    };
    var safeOptions = {};
    var mockBasket = {
        allProductLineItems: new ArrayList([{
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
            product: toProductMock(productMock)
        }],
            [{
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
                product: toProductMock(productMock2)
            }]
        ),
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
            product: toProductMock(productMock2)
        }]),
        ecomItems: new ArrayList([{
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
            product: toProductMock(productMock)
        }]),
        totalGrossPrice: new Money(true),
        totalTax: new Money(true),
        shippingTotalPrice: new Money(true)
    };

    if (safeOptions.shipping) {
        mockBasket.shipments = [safeOptions.shipping];
    } else {
        mockBasket.shipments = [{
            shippingMethod: {
                ID: '005'
            }
        }];
    }
    mockBasket.defaultShipment = mockBasket.shipments[0];

    mockBasket.getShipments = function () {
        return mockBasket.shipments;
    };
    mockBasket.getAdjustedMerchandizeTotalPrice = function () {
        return new Money(true);
    };
    mockBasket.getProductLineItems = function () {

    };

    if (safeOptions.productLineItems) {
        mockBasket.productLineItems = safeOptions.productLineItems;
    }

    if (safeOptions.totals) {
        mockBasket.totals = safeOptions.totals;
    }

    cartHelpers.getEcomAndStoreItemsFromPoductLineItems.returns({
        ecomAndStoreItems: {
            pickupInStoreItems: mockBasket.pickupInStoreItems,
            noOfStoreItems: 1,
            ecomItems: mockBasket.ecomItems,
            noOfEcomItems: 1
        }

    });

    it('should identify the number of ecom products under shipmentModel', function () {
        result = new CartModel(mockBasket);
        assert.isNotNull(result.noOfEcomItems);
    });

    it('should return shiptoaddress message', function () {
        result = new CartModel(mockBasket);
        assert.equal(result.resources.noOfEcomItems, 'mock ship to address message');
    });

    it('should identify the number of store products under shipmentModel', function () {
        result = new CartModel(mockBasket);
        assert.isNotNull(result.noOfStoreItems);
    });
});
