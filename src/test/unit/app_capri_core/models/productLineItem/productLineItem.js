'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var productLineItemDecorators = require('../../../../mocks/productLineItemDecoratorsMock');
var decorators = require('../../../../mocks/productDecoratorsMock');

productLineItemDecorators.shippingRestriction = sinon.stub();
decorators.capriAttributes = sinon.stub();
productLineItemDecorators.giftCardDetails = sinon.stub();
productLineItemDecorators.giftWrapDetails = sinon.stub();

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
function ProductLineItem() { }
mockSuperModule.create(ProductLineItem);

var productMock = {
    attributeModel: {},
    minOrderQuantity: { value: 'someValue' },
    availabilityModel: {},
    stepQuantity: { value: 'someOtherValue' },
    getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; },
    getMasterProduct: function () {
        return {
            getPrimaryCategory: function () { return { custom: { sizeChartID: 'someID' } }; }
        };
    },
    ID: 'someID'
};

var optionsMock = {
    productType: 'someProductType',
    optionModel: {},
    quantity: 1,
    variationModel: {},
    promotions: [],
    variables: [],
    lineItem: { UUID: '123' }
};

var object = {
    is_gift_card: true,
    isGiftWrapEligible: true
};

var productLineItem = proxyquire('app_capri_core/cartridge/models/productLineItem/productLineItem', {
    '*/cartridge/models/productLineItem/decorators/index': productLineItemDecorators,
    '*/cartridge/models/product/decorators/index': decorators
});

describe('Product Line Item Model', function () {
    beforeEach(function () {
        productLineItemDecorators.giftCardDetails.reset();
    });
    it('Should call shipping restriction from product line item model', function () {
        productLineItem(object, productMock, optionsMock);
        assert.isTrue(productLineItemDecorators.shippingRestriction.called);
    });
    it('Should call giftCard Details from product line item model', function () {
        productLineItem(object, productMock, optionsMock);
        assert.isTrue(productLineItemDecorators.giftCardDetails.calledOnce);
    });
    it('Should call capri attributes from product line item model', function () {
        productLineItem(object, productMock, optionsMock);
        assert.isTrue(decorators.capriAttributes.called);
    });
});
