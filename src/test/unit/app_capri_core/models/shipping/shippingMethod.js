'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseShippingMethod = require('../../../../mocks/models/shippingMethod');
mockSuperModule.create(baseShippingMethod);

var Resource = {
    msg: function () {
        return 'FREE';
    }
};

var shipmentShippingModel = {
    getShippingCost: sinon.stub()
};
var ShippingMgr = {
    getShipmentShippingModel: function () {
        return shipmentShippingModel;
    }
};

shipmentShippingModel.getShippingCost.returns({
    amount: {
        value: 40.99,
        currencyCode: 'US'
    }
});

describe('shippingMethod in app_capri_core', function () {
    var mockShippingmethod = {
        ID: '',
        displayName: 'a diplayName',
        description: 'a description'
    };
    var mockShipment = {
        shippingMethod: {
            ID: 'an ID'
        }
    };
    global.session.privacy.shippingPromotion = '{"standard":10, "express":30}';
    var getCurrencyCode = sinon.stub();
    getCurrencyCode.returns('US');
    global.session.getCurrency = function () {
        return {
            getCurrencyCode
        };
    };
    var ShippingMethodModel = proxyquire('app_capri_core/cartridge/models/shipping/shippingMethod', {
        '*/cartridge/scripts/util/formatting': {
            formatCurrency: function (value, currencyCode) {
                if (currencyCode === 'US') {
                    return '$' + value;
                }
                return value;
            }
        },
        'dw/order/ShippingMgr': ShippingMgr,
        'dw/web/Resource': Resource
    });
    var result;
    after(function () {
        getCurrencyCode.reset();
    });
    it('should return shippingCost', function () {
        result = new ShippingMethodModel(mockShippingmethod, mockShipment);
        assert.equal(result.shippingCost, '$40.99');
    });

    it('should return standard promotional shipping price', function () {
        mockShippingmethod.ID = 'standard';
        result = new ShippingMethodModel(mockShippingmethod, mockShipment);
        assert.equal(result.promotionalShippingPrice, '$10');
    });

    it('should return express promotional shipping price', function () {
        mockShippingmethod.ID = 'express';
        result = new ShippingMethodModel(mockShippingmethod, mockShipment);
        assert.equal(result.promotionalShippingPrice, '$30');
    });

    it('should return promotionalShippingPrice as empty when there is no promotion for shipping price', function () {
        global.session.privacy.shippingPromotion = '{}';
        result = new ShippingMethodModel(mockShippingmethod, mockShipment);
        assert.equal(result.promotionalShippingPrice, '');
    });

    it('should return shippingCost as FREE if shippingCost is $0', function () {
        shipmentShippingModel.getShippingCost.returns({
            amount: {
                value: 0,
                currencyCode: 'US'
            }
        });
        result = new ShippingMethodModel(mockShippingmethod, mockShipment);
        assert.equal(result.shippingCost, 'FREE');
    });
});
