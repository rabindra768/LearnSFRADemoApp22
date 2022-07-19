'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var mockCollections = require('../../../../mocks/util/collections');

var ArrayList = require('../../../../mocks/dw.util.Collection.js');
const collections = require('../../../../mocks/util/collections');
var storedLineItemObj = {
    pid: 'someID',
    shipmentId: 'shipmentId',
    custom: { test1: 'abc',
        test2: 'bcd' }
};


var mergeCartResult = {
    uuid: 'xyz'
};
var HashMap = require('dw-api-mock/dw/util/HashMap');
var mergeCartHelper = proxyquire('app_capri_core/cartridge/scripts/helpers/mergeCartHelper', {
    '*/cartridge/scripts/util/collections': mockCollections,
    'dw/util/HashMap': HashMap,
    '*/cartridge/scripts/helpers/basketCalculationHelpers': {
        calculateTotals: function () {
        }
    }
});

describe('mergeCartHelper-addPLICustomAttributes', function () {
    var createApiBasket = function () {
        var currentBasket = {
            getProductLineItems: function (a) {
                var newproductLineItem = new ArrayList([]);
                collections.forEach(this.productLineItems, function (prodItems) {
                    if (prodItems.productID === a) { newproductLineItem.add(prodItems); }
                });
                return newproductLineItem;
            },
            productLineItems: new ArrayList([{
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
                getUUID: function () {
                    return 'xyz';
                },
                custom: {
                    test1: null,
                    test2: null
                },
                productID: 'someID',
                shipment: { UUID: 'shipmentId' },
                quantityValue: 2
            }, {
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
                getUUID: function () {
                    return 'xyz';
                },
                custom: {
                    test1: null,
                    test2: null
                },
                productID: 'someID',
                shipment: { UUID: 'shipmentI' },
                quantityValue: 2
            }, {
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
                getUUID: function () {
                    return 'xy';
                },
                custom: {
                    test1: null,
                    test2: null
                },
                productID: 'someID',
                shipment: { UUID: 'shipmentId' },
                quantityValue: 2
            }]),
            allLineItems: { length: 3 }
        };
        return currentBasket;
    };
    it('should change the custom attribute of this productline item', function () {
        var currentBasket = createApiBasket();
        mergeCartHelper.addPLICustomAttributes(mergeCartResult, currentBasket, storedLineItemObj);
        assert.equal(currentBasket.productLineItems.get(0).custom.test1, storedLineItemObj.custom.test1);
    });
    it('should not change the custom attribute of this productline item', function () {
        var currentBasket = createApiBasket();
        mergeCartHelper.addPLICustomAttributes(mergeCartResult, currentBasket, storedLineItemObj);
        assert.equal(currentBasket.productLineItems.get(1).custom.test1, null);
    });
    it('should not change the custom attribute of this productline item ', function () {
        var currentBasket = createApiBasket();
        mergeCartHelper.addPLICustomAttributes(mergeCartResult, currentBasket, storedLineItemObj);
        assert.equal(currentBasket.productLineItems.get(2).custom.test1, null);
    });
});

describe('mergeCartHelper-getProductLineItemsInSB', function () {
    var createstoredBasket = function () {
        var storedbasket = {
            getShipments: function () {
                return this.storedBasketShipments;
            },
            storedBasketShipments: new ArrayList([{
                custom: { fromStoreId: null },
                productLineItems: new ArrayList([{
                    product: { online: true,
                        ID: 'someID',
                        getAvailabilityModel: function () {
                            return {
                                isOrderable: true
                            };
                        }
                    },
                    quantity: { value: 3 },
                    custom: 'abc',
                    shipment: {
                        getUUID: function () {
                            return 'uuid';
                        }
                    }

                }])
            }])
        };
        return storedbasket;
    };
    it(' getting  the attributes of productline items', function () {
        var storedBasket = createstoredBasket();
        var result = mergeCartHelper.getProductLineItemsInSB(storedBasket);
        assert.equal(result[0].pid, 'someID');
        assert.equal(result[0].qty, 3);
        assert.equal(result[0].custom, 'abc');
        assert.equal(result[0].shipmentId, 'uuid');
    });
});
describe('mergeCartHelper- mergeCouponLineItems', function () {
    var currentBasket = {
        createCouponLineItem: function (a, b) {
            this.couponLineItems.add({
                couponCode: a,
                basedOnCampaign: b
            });
        },
        updateTotals: function () {

        },
        getCouponLineItems: function () {
            return this.couponLineItems;
        },
        couponLineItems: new ArrayList([{
            couponCode: 'couponcode1',
            basedOnCampaign: true
        }, {

            couponCode: 'couponcode2',
            basedOnCampaign: true
        }])

    };

    var storedBasket = {

        getCouponLineItems: function () {
            return this.couponLineItems;
        },
        couponLineItems: new ArrayList([{
            couponCode: 'couponcode1',
            basedOnCampaign: true
        }, {

            couponCode: 'couponcode2',
            basedOnCampaign: true
        }])
    };

    it('should add the coupollineItems of storedbasket into current basket ', function () {
        mergeCartHelper.mergeCouponLineItems(currentBasket, storedBasket);
        assert.equal(currentBasket.couponLineItems.getLength(), 4);
    });
    it('should   add only 1 couponlineitem  of storedbasket into current basket', function () {
        // resetting the current basket coupon items
        currentBasket.couponLineItems = new ArrayList([{
            couponCode: 'couponcode1',
            basedOnCampaign: true
        }, {

            couponCode: 'couponcode2',
            basedOnCampaign: true
        }]);
        storedBasket.couponLineItems.get(0).couponCode = 'couponcode3';
        mergeCartHelper.mergeCouponLineItems(currentBasket, storedBasket);
        assert.equal(currentBasket.couponLineItems.getLength(), 3);
    });
    it('should  not add the couponllineItems of storedbasket into current basket', function () {
         // resetting the current basket coupon items
        currentBasket.couponLineItems = new ArrayList([{
            couponCode: 'couponcode1',
            basedOnCampaign: true
        }, {

            couponCode: 'couponcode2',
            basedOnCampaign: true
        }]);
        storedBasket = {
            getCouponLineItems: function () {

            }
        };
        mergeCartHelper.mergeCouponLineItems(currentBasket, storedBasket);
        assert.equal(currentBasket.couponLineItems.getLength(), 2);
    });
});

