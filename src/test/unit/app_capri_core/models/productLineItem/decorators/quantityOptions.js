'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var productHelpers = {
    getMaxOrderQuantity: sinon.stub()
};
var quantityOptions = proxyquire('app_capri_core/cartridge/models/productLineItem/decorators/quantityOptions', {
    'dw/catalog/ProductInventoryMgr': require('../../../../../mocks/dw/catalog/ProductInventoryMgr'),
    '*/cartridge/config/preferences': {
        maxOrderQty: null
    },
    '*/cartridge/scripts/helpers/productHelpers': productHelpers
});

describe('Product line item quantity options decorator', function () {
    describe('When no inventory list provided', function () {
        var productLineItemMock = {
            product: {
                availabilityModel: {
                    inventoryRecord: {
                        ATS: {
                            value: 5
                        },
                        perpetual: false
                    }
                },
                minOrderQuantity: {
                    value: 1
                },
                maxOrderQuantity: null
            }
        };

        it('Should create quantityOptions property for passed in object', function () {
            var object = {};
            productHelpers.getMaxOrderQuantity.returns(5);
            quantityOptions(object, productLineItemMock, 1);
            assert.equal(object.quantityOptions.minOrderQuantity, 1);
            assert.equal(object.quantityOptions.maxOrderQuantity, 5);
        });

        it('Should handle no minOrderQuantity on the product', function () {
            var object = {};
            productLineItemMock.product.minOrderQuantity.value = null;
            productHelpers.getMaxOrderQuantity.returns(5);
            quantityOptions(object, productLineItemMock, 1);
            assert.equal(object.quantityOptions.minOrderQuantity, 1);
            assert.equal(object.quantityOptions.maxOrderQuantity, 5);
        });

        it('Should handle perpetual inventory on the product', function () {
            var object = {};
            productLineItemMock.product.availabilityModel.inventoryRecord.perpetual = true;
            quantityOptions(object, productLineItemMock, 1);
            assert.equal(object.quantityOptions.minOrderQuantity, 1);
            assert.equal(object.quantityOptions.maxOrderQuantity, 10);
        });
    });

    describe('When inventory list provided', function () {
        it('Should return inventory of the specified productInventoryListID', function () {
            var productLineItemMock = {
                product: {
                    availabilityModel: {
                        inventoryRecord: {
                            ATS: {
                                value: 5
                            },
                            perpetual: false
                        }
                    },
                    minOrderQuantity: {
                        value: 2
                    },
                    maxOrderQuantity: null,
                    ID: '000002'
                },
                productInventoryListID: 'inventoryListId0001'
            };

            var object = {};
            productHelpers.getMaxOrderQuantity.returns(3);
            quantityOptions(object, productLineItemMock, 1);
            assert.equal(object.quantityOptions.minOrderQuantity, 2);
            assert.equal(object.quantityOptions.maxOrderQuantity, 3);
        });
    });
});
