'use strict';

var assert = require('chai').assert;
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var mockCollections = require('../../../../mocks/util/collections');
var ArrayList = require('../../../../mocks/dw.util.Collection');
var ShippingMethodModel = require('../../../../mocks/models/shippingMethod');
var ShippingMgr = require('../../../../mocks/dw/order/ShippingMgr');
var ShippingModel = require('../../../../mocks/models/shipping');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseShippingHelpers = require('../../../../mocks/helpers/shippingHelpers');
mockSuperModule.create(baseShippingHelpers);

var Site = {
    getCurrent: sinon.stub()
};
var shippingHelpers = proxyquire('app_capri_core/cartridge/scripts/checkout/shippingHelpers', {
    '*/cartridge/scripts/util/collections': mockCollections,
    'dw/util/ArrayList': ArrayList,
    '*/cartridge/models/shipping/shippingMethod': ShippingMethodModel,
    'dw/order/ShippingMgr': ShippingMgr,
    '*/cartridge/models/shipping': ShippingModel,
    'dw/system/Transaction': {
        wrap: function (callback) {
            return callback();
        }
    },
    'dw/system/Site': Site
});

var address = {
    stateCode: 'MA',
    postalCode: '01803'
};

var shippingMethods = new ArrayList([
    {
        ID: '001',
        displayName: 'Ground',
        description: 'Order received within 7-10 business days',
        custom: {
            estimatedArrivalTime: '7-10 Business Days'
        }
    },
    {
        ID: '002',
        displayName: '2-Day Express',
        description: 'Order received in 2 business days',
        custom: {
            estimatedArrivalTime: '2 Business Days'
        }
    },
    {
        ID: '003',
        displayName: 'Overnight',
        description: 'Order received the next business day',
        custom: {
            estimatedArrivalTime: 'Next Day'
        }
    }
]);

function getShipment(UUID, stateCode, postalCode, userSelectedShippingMethodID) {
    var shipment = {
        UUID: UUID,
        shippingMethod: shippingMethods,
        shippingAddress: {
            stateCode: stateCode,
            postalCode: postalCode
        },
        custom: {
            userSelectedShippingMethodID: userSelectedShippingMethodID
        },
        getProductLineItems: function () {
            var productLineItemsMock = new ArrayList([
                {
                    ID: 'P001',
                    product: {
                        custom: {
                            'is_product_hazmat': true
                        }
                    }
                },
                {
                    ID: 'P002',
                    product: {
                        custom: {
                            'is_product_hazmat': true
                        }
                    }
                }
            ]);
            return (productLineItemsMock);
        }
    };
    return shipment;
}

var shipment1 = {
    UUID: '001',
    shippingMethod: {
        custom: {
            storePickupEnabled: true
        }
    }
};

var shipment2 = {
    UUID: '002',
    shippingMethod: {
        custom: {
            storePickupEnabled: false
        }
    }
};

var shipment3 = {
    UUID: '003',
    shippingMethod: {
        custom: {
            storePickupEnabled: false
        }
    }
};

var shipment4 = {
    UUID: '004',
    shippingMethod: {
        custom: {
            storePickupEnabled: true
        }
    }
};

var shippingRestrictionJSONMock = '{"is_product_hazmat": {"enabled": true, "exclusions": [{"shipping_method_ids": "usTwoDay,usOvernight,usGroundPS,usGround", "stateCode": "AK,HI,GU,PR,AA,AE,AP,VI,MP", "countryCode": ""}]}, "is_product_exotic": {"enabled": true, "exclusions": [{"shipping_method_ids": "usTwoDay,usOvernight,usGroundPS,usGround", "stateCode": "CA,NJ,VA", "countryCode": ""}]}}';

function MockBasket() {}

MockBasket.prototype.getShipments = function () {
    return new ArrayList([shipment1, shipment2, shipment3, shipment4]);
};


describe('shippingHelpers', function () {
    Site.getCurrent.returns({
        getCustomPreferenceValue: function (a) {
            if (a === 'customProductAttributeShipRestriction') {
                return false;
            }
            return true;
        }
    });
    describe('function - getApplicableShippingMethods', function () {
        function getApplicableShippingMethods(select1, select2) {
            var applicableShippingMethods = [
                {
                    description: 'Order received within 7-10 business days',
                    displayName: 'Ground',
                    default: undefined,
                    ID: '001',
                    shippingCost: '$0.00',
                    estimatedArrivalTime: '7-10 Business Days',
                    selected: select1
                },
                {
                    description: 'Order received in 2 business days',
                    displayName: '2-Day Express',
                    default: undefined,
                    ID: '002',
                    shippingCost: '$0.00',
                    estimatedArrivalTime: '2 Business Days',
                    selected: select2
                }
            ];
            return applicableShippingMethods;
        }

        it('should return valid shipping methods', function () {
            var result = shippingHelpers.getApplicableShippingMethods(getShipment('someUUID', 'CA', '97123', '001'), address);
            assert.deepEqual(result, getApplicableShippingMethods(undefined, undefined));
        });

        it('should return null if there is no valid shipment details', function () {
            var result = shippingHelpers.getApplicableShippingMethods(null, address);
            assert.isNull(result);
        });

        it('should return valid shipping methods when no address details are provided', function () {
            var result = shippingHelpers.getApplicableShippingMethods(getShipment('someUUID', 'CA', '97123', '001'), null);
            assert.deepEqual(result, getApplicableShippingMethods(undefined, undefined));
        });

        it('should return no valid shipping methods when no address and shipping address are provided', function () {
            var shipment = {
                UUID: 'someID',
                custom: {
                    fromStoreId: ''
                }
            };
            var result = shippingHelpers.getApplicableShippingMethods(shipment, null);
            assert.deepEqual(result, getApplicableShippingMethods(true, false));
        });

        it('should return no valid shipping methods when there is a storeID', function () {
            var shipment = {
                UUID: 'someID',
                custom: {
                    fromStoreId: 'someID'
                }
            };
            var result = shippingHelpers.getApplicableShippingMethods(shipment, null);
            assert.deepEqual(result, []);
        });
    });

    describe('function - setCustomShipmentAttributes', function () {
        it('should return valid shipping methods', function () {
            var shipment = {
                UUID: 'someUUID',
                shippingMethod: {
                    ID: '001',
                    displayName: 'Ground',
                    description: 'Order received within 7-10 business days',
                    custom: {
                        estimatedArrivalTime: '7-10 Business Days'
                    }
                },
                custom: {
                    userSelectedShippingMethodID: null
                }
            };
            var result = shippingHelpers.setCustomShipmentAttributes(shipment, '001');
            assert.isUndefined(result);
        });
    });

    describe('function - getShippingModels', function () {
        it('should handle a basket with multiple shipments', function () {
            var mockResult = [
                {
                    UUID: '002',
                    applicableShippingMethods: [
                        {
                            ID: '001',
                            description: 'Order received within 7-10 business days',
                            displayName: 'Ground',
                            estimatedArrivalTime: '7-10 Business Days',
                            shippingCost: '$0.00'
                        },
                        {
                            ID: '002',
                            description: 'Order received in 2 business days',
                            displayName: '2-Day Express',
                            estimatedArrivalTime: '2 Business Days',
                            shippingCost: '$9.99'
                        }
                    ],
                    giftMessage: undefined,
                    isGift: undefined,
                    matchingAddressId: false,
                    productLineItems: {
                        items: [],
                        totalQuantity: 0
                    },
                    selectedShippingMethod: {
                        ID: undefined,
                        default: undefined,
                        description: undefined,
                        displayName: undefined,
                        estimatedArrivalTime: undefined,
                        selected: undefined,
                        shippingCost: '$0.00'
                    },
                    shippingAddress: null
                },
                {
                    UUID: '003',
                    applicableShippingMethods: [
                        {
                            ID: '001',
                            description: 'Order received within 7-10 business days',
                            displayName: 'Ground',
                            estimatedArrivalTime: '7-10 Business Days',
                            shippingCost: '$0.00'
                        },
                        {
                            ID: '002',
                            description: 'Order received in 2 business days',
                            displayName: '2-Day Express',
                            estimatedArrivalTime: '2 Business Days',
                            shippingCost: '$9.99'
                        }
                    ],
                    giftMessage: undefined,
                    isGift: undefined,
                    matchingAddressId: false,
                    productLineItems: {
                        items: [],
                        totalQuantity: 0
                    },
                    selectedShippingMethod: {
                        ID: undefined,
                        default: undefined,
                        description: undefined,
                        displayName: undefined,
                        estimatedArrivalTime: undefined,
                        selected: undefined,
                        shippingCost: '$0.00'
                    },
                    shippingAddress: null
                },
                {
                    UUID: '001',
                    applicableShippingMethods: [
                        {
                            ID: '001',
                            description: 'Order received within 7-10 business days',
                            displayName: 'Ground',
                            estimatedArrivalTime: '7-10 Business Days',
                            shippingCost: '$0.00'
                        },
                        {
                            ID: '002',
                            description: 'Order received in 2 business days',
                            displayName: '2-Day Express',
                            estimatedArrivalTime: '2 Business Days',
                            shippingCost: '$9.99'
                        }
                    ],
                    giftMessage: undefined,
                    isGift: undefined,
                    matchingAddressId: false,
                    productLineItems: {
                        items: [],
                        totalQuantity: 0
                    },
                    selectedShippingMethod: {
                        ID: undefined,
                        default: undefined,
                        description: undefined,
                        displayName: undefined,
                        estimatedArrivalTime: undefined,
                        selected: undefined,
                        shippingCost: '$0.00'
                    },
                    shippingAddress: null
                },
                {
                    UUID: '004',
                    applicableShippingMethods: [
                        {
                            ID: '001',
                            description: 'Order received within 7-10 business days',
                            displayName: 'Ground',
                            estimatedArrivalTime: '7-10 Business Days',
                            shippingCost: '$0.00'
                        },
                        {
                            ID: '002',
                            description: 'Order received in 2 business days',
                            displayName: '2-Day Express',
                            estimatedArrivalTime: '2 Business Days',
                            shippingCost: '$9.99'
                        }
                    ],
                    giftMessage: undefined,
                    isGift: undefined,
                    matchingAddressId: false,
                    productLineItems: {
                        items: [],
                        totalQuantity: 0
                    },
                    selectedShippingMethod: {
                        ID: undefined,
                        default: undefined,
                        description: undefined,
                        displayName: undefined,
                        estimatedArrivalTime: undefined,
                        selected: undefined,
                        shippingCost: '$0.00'
                    },
                    shippingAddress: null
                }
            ];
            var mockBasket = new MockBasket();
            var shippingModels = shippingHelpers.getShippingModels(mockBasket);
            assert.deepEqual(shippingModels, mockResult);
            assert.equal(shippingModels.length, 4);
        });

        it('should handle a basket with no shipments', function () {
            var mockBasket = {
                getShipments: function () {
                    return null;
                }
            };
            var shippingModels = shippingHelpers.getShippingModels(mockBasket);
            assert.equal(shippingModels.length, 0);
        });
    });

    describe('function - getCustomShippingRestrictions', function () {
        it('should handle custom shipping restrictions', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'customProductAttributeShipRestriction') {
                        return shippingRestrictionJSONMock;
                    }
                    return false;
                }
            });
            var resultMock = ['usTwoDay', 'usOvernight', 'usGroundPS', 'usGround'];
            var result = shippingHelpers.getCustomShippingRestrictions(getShipment('someUUID', 'AK', '97123', '001'));
            assert.deepEqual(result, resultMock);
        });
    });
});
