'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var mockCollections = require('../../../../../mocks/util/collections');
var priceTotal = proxyquire('app_capri_core/cartridge/models/productLineItem/decorators/priceTotal', {
    'dw/catalog/ProductInventoryMgr': require('../../../../../mocks/dw/catalog/ProductInventoryMgr'),
    '*/cartridge/scripts/util/collections': mockCollections,
    '*/cartridge/scripts/renderTemplateHelper': {
        getRenderedHtml: function () { return true; }
    },
    'dw/util/StringUtils': {
        formatMoney: function () {
            return 'formatted money';
        }
    },
    'checkout/productCard/productCardProductRenderedTotalPrice': {},
    'dw/value/Money': require('../../../../../mocks/dw.value.Money')
});

describe('Product line item PriceTotal decorator', function () {
    var object;
    beforeEach(function () { object = {}; });
    var productLineItemMock = {
        custom: {
            listPrice: 10
        },
        optionProductLineItems: [{
        }],
        priceAdjustments: {
            getLength: sinon.stub()
        },
        adjustedPrice: {
            value: 1,
            add: sinon.stub()
        },
        getPrice: sinon.stub()
    };
    it('Should return the list price and price in formatted money', function () {
        productLineItemMock.adjustedPrice.add.returns({ value: 1 });
        productLineItemMock.priceAdjustments.getLength.returns(2);
        priceTotal(object, productLineItemMock);
        assert.equal(object.priceTotal.listPrice, 'formatted money');
        assert.equal(object.priceTotal.price, 'formatted money');
    });
    it('Should not return the list price as formatted money if price is greater than list price value', function () {
        productLineItemMock.adjustedPrice.add.returns({ value: 20 });
        productLineItemMock.priceAdjustments.getLength.returns(0);
        priceTotal(object, productLineItemMock);
        assert.equal(object.priceTotal.listPrice, '');
        assert.equal(object.priceTotal.price, 'formatted money');
    });
});
