'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../../mocks/dw.util.Collection');
var checkoutHelpers = require('../../../../mocks/helpers/checkoutHelpers');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseBasketValidationHelper = proxyquire('app_storefront_base/cartridge/scripts/helpers/basketValidationHelpers', {
    'dw/catalog/ProductInventoryMgr': {
        getInventoryList: function () {
            return {
                getRecord: function () {
                    return {
                        ATS: {
                            value: 3
                        }
                    };
                }
            };
        }
    },
    'dw/web/Resource': {
        msg: function (param) {
            return param;
        }
    },
    '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
        'dw/util/ArrayList': ArrayList
    }),
    'dw/catalog/StoreMgr': {
        getStore: function () {
            return {
                custom: {
                    inventoryListId: 'someID'
                }
            };
        }
    },
    '*/cartridge/scripts/checkout/checkoutHelpers': checkoutHelpers
});
mockSuperModule.create(baseBasketValidationHelper);

var Site = {
    getCurrent: sinon.stub()
};
var Resource = {
    msg: sinon.stub()
};
var productHelper = {
    getCurrentOptionModel: sinon.stub()
};
var cartHelpers = {
    addLineItem: sinon.stub()
};

var productLineItems1 = new ArrayList([{
    product: {
        online: true,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 0
                    }
                };
            }
        }
    },
    custom: {},
    productID: 'someID',
    quantityValue: 2
}]);

var productLineItems2 = new ArrayList([{
    product: {
        online: false,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 0
                    }
                };
            }
        }
    },
    custom: {},
    productID: 'someID',
    quantityValue: 2
}]);

var productLineItems3 = new ArrayList([{
    product: {
        online: true,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 0
                    }
                };
            }
        }
    },
    custom: {
        fromStoreId: new ArrayList([{}])
    },
    productID: 'someID',
    quantityValue: 2
}]);

var productLineItems4 = new ArrayList([{
    product: {
        online: true,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 0
                    }
                };
            }
        }
    },
    custom: {
        fromStoreId: new ArrayList([{}])
    },
    productID: 'someID',
    quantityValue: 5
}]);

var productLineItems5 = new ArrayList([{
    product: {
        online: true,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 1
                    }
                };
            }
        }
    },
    custom: {},
    productID: 'someID',
    quantityValue: 5
}]);

var productLineItems6 = new ArrayList([{
    product: {
        online: true,
        availabilityModel: {
            getAvailabilityLevels: function () {
                return {
                    notAvailable: {
                        value: 0
                    }
                };
            }
        }
    },
    custom: {},
    productID: 'someID',
    quantityValue: 3,
    setQuantityValue: function () {
        return 1;
    }
}]);

var lineItemContainer = {
    totalTax: {
        available: false
    },
    merchandizeTotalPrice: {
        available: true
    },
    productLineItems: productLineItems1,
    getAllProductQuantities: function () {
        return {
            get: function () {
                return {
                    value: lineItemContainer.productLineItems.quantityValue
                };
            }
        };
    }
};

describe('basket validation helpers', function () {
    var basketValidationHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/basketValidationHelpers', {
        'dw/system/Site': Site,
        'dw/catalog/ProductInventoryMgr': {
            getInventoryList: function () {
                return {
                    getRecord: function () {
                        return {
                            ATS: {
                                value: 3
                            }
                        };
                    }
                };
            }
        },
        '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
            'dw/util/ArrayList': ArrayList
        }),
        'dw/catalog/StoreMgr': {
            getStore: function () {
                return {
                    custom: {
                        inventoryListId: 'someID'
                    }
                };
            }
        },
        'dw/web/Resource': Resource,
        'dw/system/Transaction': {
            wrap: function (callback) {
                return callback();
            }
        },
        '*/cartridge/scripts/cart/cartHelpers': cartHelpers,
        '*/cartridge/scripts/helpers/productHelpers': productHelper
    });

    describe('validateProducts function', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'singleQuantityLineItemsOnly') {
                    return false;
                }
                return true;
            }
        });

        it('should validate a basket', function () {
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isFalse(result.error);
            assert.equal(result.message, null);
        });

        it('should invalidate a basket when product not online', function () {
            lineItemContainer.productLineItems = productLineItems2;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isTrue(result.error);
        });

        it('should validate a basket when product has inStore inventory', function () {
            lineItemContainer.productLineItems = productLineItems3;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isFalse(result.error);
        });

        it('should return error as true when inventory is less than the user requested when product has inStore inventory', function () {
            lineItemContainer.productLineItems = productLineItems4;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isTrue(result.error);
        });

        it('should return error as true when inventory is less than the user requested when basket is valdated', function () {
            lineItemContainer.productLineItems = productLineItems5;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isTrue(result.error);
        });

        it('should return error as false when singleQuantityLineItemsOnly is enabled and basket is valdated', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'singleQuantityLineItemsOnly') {
                        return true;
                    }
                    return false;
                }
            });
            lineItemContainer.productLineItems = productLineItems1;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isFalse(result.error);
        });

        it('should return error as true when singleQuantityLineItemsOnly is enabled and basket is valdated', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'singleQuantityLineItemsOnly') {
                        return true;
                    }
                    return false;
                }
            });
            lineItemContainer.productLineItems = productLineItems5;
            var result = basketValidationHelpers.validateProducts(lineItemContainer);
            assert.isTrue(result.error);
        });
    });

    describe('validateSingleQuantity function', function () {
        it('should return error as false when singleQuantityLineItemsOnly is not enabled', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'singleQuantityLineItemsOnly') {
                        return false;
                    }
                    return true;
                }
            });
            lineItemContainer.productLineItems = productLineItems1;
            var result = basketValidationHelpers.validateSingleQuantity(lineItemContainer);
            assert.isFalse(result.error);
        });

        it('should return error as false when basket is validated', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'singleQuantityLineItemsOnly') {
                        return true;
                    }
                    return false;
                }
            });
            lineItemContainer.productLineItems = productLineItems6;
            var result = basketValidationHelpers.validateSingleQuantity(lineItemContainer);
            assert.isFalse(result.error);
        });
    });
});
