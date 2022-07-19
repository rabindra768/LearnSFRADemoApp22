'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var variantUrl = proxyquire('app_capri_core/cartridge/models/product/decorators/variantUrl.js', {
    'dw/web/URLUtils': { url: function () { return 'mockUrl'; } },
    '*/cartridge/config/ConfigMgr': {
        getConstants: function () {
            return {
                PRODUCT_URL: 'Product-Show',
                QUICKVIEW_URL: 'Product-ShowQuickView',
                TILE_UPDATE_URL: 'Tile-ShowAjax',
                ATTRIBUTE_COLOR: 'color'
            };
        },
        getPreferences: function () {
            return {
                useMasterUrlInSearch: true
            };
        }
    }
});
var mockVariationModel1 = {
    url: function () { return 'mockActionUrl'; }
};
var apiProductMock = {
    ID: 'mockId'
};

describe('variationUrl decorator app_capri_core', function () {
    var mockObject = {
        variationAttributes: [{
            id: 'color',
            values: [{
                selected: true,
                url: 'some URL'
            }]
        }]
    };

    it('should return url from variationAttributes url for selectedVariantProductUrl', function () {
        variantUrl(mockObject, mockVariationModel1, apiProductMock);
        assert.equal(mockObject.selectedVariantProductUrl, 'some URL');
    });

    it('should return url from variationAttributes url for selectedVariantQuickViewUrl', function () {
        variantUrl(mockObject, mockVariationModel1, apiProductMock);
        assert.equal(mockObject.selectedVariantQuickViewUrl, 'some URL');
    });
});
