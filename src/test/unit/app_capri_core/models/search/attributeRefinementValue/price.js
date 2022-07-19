'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

describe('PriceAttributeValue model in app_capri_core', function () {
    var BaseAttributeValue = proxyquire('app_storefront_base/cartridge/models/search/attributeRefinementValue/base', {
        'dw/web/Resource': {
            msgf: function () { return 'some product title'; }
        }
    });

    var mockProductSearch = {
        isRefinedByPriceRange: function () { return true; },
        urlRelaxPrice: function () {
            return {
                relative: function () {
                    return {
                        toString: function () { return 'relax url'; }
                    };
                }
            };
        },
        urlRefinePrice: function () {
            return {
                relative: function () {
                    return {
                        toString: function () { return 'select url'; }
                    };
                }
            };
        }
    };

    var mockRefinementDefinition = {};

    var mockRefinementValue = {
        ID: 'product1',
        presentationID: 'prez',
        value: 'some value',
        displayValue: 'some display value',
        hitCount: 10
    };

    var PriceAttributeValue = proxyquire('app_capri_core/cartridge/models/search/attributeRefinementValue/price', {
        '*/cartridge/models/search/attributeRefinementValue/base': BaseAttributeValue
    });

    var priceAttributeValue;

    it('should instantiate a Price Attribute Value model', function () {
        priceAttributeValue = new PriceAttributeValue(mockProductSearch, mockRefinementDefinition, mockRefinementValue);

        assert.deepEqual(priceAttributeValue, {
            displayValue: 'some display value',
            selected: true,
            title: 'some product title',
            url: 'relax url',
            hitCount: 10
        });
    });

    it('should instantiate an unselected Price Attribute Value model', function () {
        mockProductSearch.isRefinedByPriceRange = function () {
            return false;
        };
        priceAttributeValue = new PriceAttributeValue(mockProductSearch, mockRefinementDefinition, mockRefinementValue);

        assert.deepEqual(priceAttributeValue, {
            displayValue: 'some display value',
            selected: false,
            title: 'some product title',
            url: 'select url',
            hitCount: 10
        });
    });
});
