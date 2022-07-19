'use strict';

var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var Resource = {
    msg: sinon.stub()
};

var ContentMgr = {
    getContent: sinon.stub()
};

var soldOutAsset = {
    custom: {
        body: {
            markup: 'Coming Soon'
        }
    }
};

function getObjectMock(available, soldOutLabel) {
    var objectMock = {
        available: available,
        soldOutLabel: soldOutLabel
    };
    return objectMock;
}

function getProductMock(variantSoldout, masterSoldout, variantValue) {
    var productMock;
    if (masterSoldout) {
        productMock = {
            custom: {
                soldOut: variantSoldout,
                is_product_customizable: 'true',
                is_product_monogrammable: 'true',
                is_product_engravable: 'true'
            },
            masterProduct: {
                custom: {
                    soldOut: masterSoldout
                }
            },
            isVariant: function () {
                return (variantValue);
            }
        };
        return productMock;
    }
    productMock = {
        custom: {
            soldOut: variantSoldout,
            is_product_customizable: 'true',
            is_product_monogrammable: 'true',
            is_product_engravable: 'true'
        },
        isVariant: function () {
            return (variantValue);
        }
    };
    return productMock;
}

var capriAttributes = proxyquire('app_capri_core/cartridge/models/product/decorators/capriAttributes', { 'dw/web/Resource': Resource,
    'dw/content/ContentMgr': ContentMgr,
    '*/cartridge/config/ConfigMgr': { getConstants: function () {
        var BOOLEANS = {
            BOOLEANS: { TRUE: 'true',
                FALSE: 'false' }
        };
        return BOOLEANS;
    } } });

describe('capriAttributes Decorator', function () {
    before(function () {
        ContentMgr.getContent.returns(soldOutAsset);
    });
    describe('Testing when the product is a variant product', function () {
        it('Displaying Sold Out label based on variant Sold Out CTA label', function () {
            var objectMock = getObjectMock(false, null);
            var productMock = getProductMock(null, null, true);
            Resource.msg.returns('Sold Out');
            capriAttributes(objectMock, productMock);
            assert.equal(objectMock.soldOutLabel, 'Sold Out');
        });

        it('Displaying authored sold out label(Coming Soon) based on variant Sold Out CTA label', function () {
            var objectMock = getObjectMock(false, null);
            var productMock = getProductMock('Coming Soon', null, true);
            Resource.msg.returns('Sold Out');
            capriAttributes(objectMock, productMock);
            assert.equal(objectMock.soldOutLabel, 'Coming Soon');
        });

        it('Displaying authored sold out label(Coming Soon) based on master Sold Out CTA label', function () {
            var objectMock = getObjectMock(false, null);
            var productMock = getProductMock(null, 'Coming Soon', true);
            Resource.msg.returns('Sold Out');
            capriAttributes(objectMock, productMock);
            assert.equal(objectMock.soldOutLabel, 'Coming Soon');
        });
    });

    describe('Testing when the product is not a variant product', function () {
        it('Displaying Sold Out label based on product Sold Out CTA label', function () {
            var objectMock = getObjectMock(false, null);
            var productMock = getProductMock(null, false, false);
            Resource.msg.returns('Sold Out');
            capriAttributes(objectMock, productMock);
            assert.equal(objectMock.soldOutLabel, 'Sold Out');
        });

        it('Displaying authored sold out label(Coming Soon) based on product Sold Out CTA label', function () {
            var objectMock = getObjectMock(false, null);
            var productMock = getProductMock('Coming Soon', false, false);
            Resource.msg.returns('Sold Out');
            capriAttributes(objectMock, productMock);
            assert.equal(objectMock.soldOutLabel, 'Coming Soon');
        });
    });
    it('Displaying Add to Bag when product is available', function () {
        var objectMock = getObjectMock(true, null);
        var productMock = getProductMock(null, false, false);
        Resource.msg.returns('Add to Bag');
        capriAttributes(objectMock, productMock);
        assert.equal(objectMock.soldOutLabel, 'Add to Bag');
    });
});
