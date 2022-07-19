
'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var ArrayList = require('../../../../mocks/dw.util.Collection');

var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var stubproductTileAjax = sinon.stub();

describe('stubproductMock', function () {
    var tileProduct = proxyquire('app_capri_core/cartridge/scripts/factories/tileProduct', {
        '*/cartridge/models/product/productTileAjax': stubproductTileAjax,
        '*/cartridge/scripts/helpers/productHelpers': {
            getConfig: function () {
            }
        },
        'dw/catalog/ProductMgr': {
            getProduct: function (productID) {
                if (productID) { return 'some product'; }
                return null;
            }
        }
    });
    var params = {};
    var params1 = {
        pid: 'someID'
    };
    var productMock = {
        optionModel: {
            options: new ArrayList([])
        },
        variationModel: {
            master: false,
            selectedVariant: false,
            productVariationAttributes: new ArrayList([{
                color: {
                    ID: 'someID',
                    value: 'blue'
                }
            }]),
            getAllValues: function () {
                return new ArrayList([{
                    value: 'someValue'
                }]);
            },
            setSelectedAttributeValue: function () {},
            getSelectedVariant: function () {}
        },

        master: false,
        variant: false,
        variationGroup: false,
        productSet: false,
        bundle: false,
        optionProduct: false
    };
    it('should return empty tileProduct when product is null', function () {
        var result = tileProduct.get(params);
        assert.deepEqual(result, {});
    });
    it('should return full tileProduct ', function () {
        stubproductTileAjax.returns(productMock);
        var result = tileProduct.get(params1);
        assert.deepEqual(result, productMock);
    });
});
