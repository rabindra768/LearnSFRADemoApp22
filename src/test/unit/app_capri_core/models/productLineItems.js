'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../mocks/dw.util.Collection');
var toProductMock = require('../../../util');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../mocks/modules/mockModuleSuperModule');

var baseProductLineItems = require('../../../mocks/models/productLineItems');

mockSuperModule.create(baseProductLineItems);

var ProductLineItemsModel = proxyquire('app_capri_core/cartridge/models/productLineItems', {});


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

var productMock = {
    variationModel: {
        productVariationAttributes: new ArrayList([{
            attributeID: '',
            value: ''
        }]),
        selectedVariant: productVariantMock
    }
};

var mockItem1 = {
    bonusProductLineItem: true,
    gift: false,
    UUID: 'some UUID',
    adjustedPrice: {
        value: 'some value',
        currencyCode: 'US'
    },
    quantity: {
        value: 1
    },
    product: toProductMock(productMock),
    custom: { bonusProductLineItemUUID: '', preOrderUUID: '' }
};

var mockItem2 = {
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
    product: toProductMock(productMock),
    custom: { bonusProductLineItemUUID: 'someUUID', preOrderUUID: 'someUUID' },
    optionProductLineItems: new ArrayList([{ optionID: 'someOptionID', optionValueID: 'someIDValue' }])
};

var apiBasketBonusLineItems = {
    productLineItems: new ArrayList([mockItem1, mockItem2])
};

var reversemockItem1 = {
    bonusProductLineItemUUID: null,
    bonusProducts: [
        {
            bonusProductLineItemUUID: null,
            bonusProducts: null
        }
    ]
};

var reversemockItem2 = {
    bonusProductLineItemUUID: null,
    bonusProducts: null
};

var reverseProductLineItemMock = [reversemockItem1, reversemockItem2];

describe('ProductLineItems model', function () {
    it('Should return items in reverse order', function () {
        var result = new ProductLineItemsModel(apiBasketBonusLineItems.productLineItems);
        assert.equal(result.items.length, 2);
        assert.deepEqual(result.items, reverseProductLineItemMock);
    });

    it('Should return value for total quantity', function () {
        var result = new ProductLineItemsModel(apiBasketBonusLineItems.productLineItems);
        assert.equal(result.totalQuantity, 2);
    });
});
