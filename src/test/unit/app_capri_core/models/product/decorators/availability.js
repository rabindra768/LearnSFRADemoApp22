'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var Site = require('dw-api-mock/dw/system/Site');
var Resource = require('../../../../../mocks/dw/web/Resource');
function getProductMock(isvariant, variantThreshold, variantMsg, masterMsg) {
    var productMock = {
        isVariant: function () {
            return isvariant;
        },
        custom: {
            limitedStockThreshold: variantThreshold,
            limitedStockMessage: variantMsg
        },
        masterProduct: {
            custom: {
                limitedStockThreshold: 5,
                limitedStockMessage: masterMsg
            }
        }
    };
    return productMock;
}
var ProductMgr = {
    getProduct: function (id) {
        if (id === 1) {
            return getProductMock(true, 10, 'variant message', '');
        } else if (id === 2) {
            return getProductMock(true, 0, '', 'master message');
        }
        return getProductMock(false, 5, '', '');
    }
};
var site = Site.getCurrent();
site.setCustomPreferenceValue('limitedStockThreshold', 10);

var availability = proxyquire('app_capri_core/cartridge/models/product/decorators/availability', {
    'dw/system/Site': {
        getCurrent: function () {
            return site;
        }
    },
    'dw/web/Resource': Resource,
    'dw/catalog/ProductMgr': ProductMgr
});

describe('availability decorator', function () {
    var mockObject;
    var mockDate = new Date();
    var mockMinOrderQuantity = 1;
    var mockQuantity = '2';
    var mockAvailabilityModel = {
        getAvailabilityLevels: function (productQty) {
            var availabilityModelLevels = { inStock: {
                value: productQty
            } };
            return availabilityModelLevels;
        },
        inventoryRecord: {
            inStockDate: {
                mockDate,
                toDateString: function () {
                    return mockDate.toDateString();
                }
            },
            ATS: {
                value: 2
            }
        },
        isOrderable: function () {
            return true;
        }
    };
    it('should return "variant message" when product is variant', function () {
        mockObject = {
            id: 1
        };
        availability(mockObject, mockQuantity, mockMinOrderQuantity, mockAvailabilityModel);
        // eslint-disable-next-line array-bracket-spacing
        assert.deepEqual(mockObject.availability.messages, [ 'variant message' ]);
    });
    it('should return "master message" when product is master', function () {
        mockObject = {
            id: 2
        };
        availability(mockObject, mockQuantity, mockMinOrderQuantity, mockAvailabilityModel);
        // eslint-disable-next-line array-bracket-spacing
        assert.deepEqual(mockObject.availability.messages, [ 'master message' ]);
    });
    it('should return "limited availability" message when product is not configured at master', function () {
        mockObject = {
            id: 3
        };
        mockQuantity = '';
        availability(mockObject, mockQuantity, mockMinOrderQuantity, mockAvailabilityModel);
        // eslint-disable-next-line array-bracket-spacing
        assert.deepEqual(mockObject.availability.messages, [ 'FPO - Limited Availability' ]);
    });
    it('should return inStockDate as null when stockDate details is not available', function () {
        mockAvailabilityModel.inventoryRecord.inStockDate = null;
        mockObject = {
            id: 3
        };
        availability(mockObject, mockQuantity, mockMinOrderQuantity, mockAvailabilityModel);
        assert.isNull(mockObject.availability.inStockDate);
    });
});
