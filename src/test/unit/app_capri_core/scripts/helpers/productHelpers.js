'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var mockCollections = require('../../../../mocks/util/collections');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var stubCategoryMock = sinon.stub();
var stubProductFactoryGet = sinon.stub();
var stubGetPage = sinon.stub();
var stubSearchModel = sinon.stub();
var Site = {
    getCurrent: sinon.stub()

};
var stubGetProduct = sinon.stub();
var categoryMock = {
    displayName: 'some name',
    ID: 'some ID',
    parent: {
        ID: 'root'
    }
};
var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseHelper = proxyquire('app_storefront_base/cartridge/scripts/helpers/productHelpers', {
    '*/cartridge/scripts/util/collections': mockCollections,
    '*/cartridge/scripts/helpers/urlHelpers': {
        appendQueryParams: function () { return 'some url'; }
    },
    'dw/campaign/PromotionMgr': {
        activeCustomerPromotions: {
            getProductPromotions: function () { return 'promotions'; }
        }
    },
    'dw/web/URLUtils': {
        url: function () { return 'some url'; }
    },
    '*/cartridge/scripts/factories/product': {
        get: stubProductFactoryGet
    },
    '*/cartridge/scripts/helpers/pageMetaHelper': {
        setPageMetaData: function () { },
        setPageMetaTags: function () { }
    },
    '*/cartridge/scripts/helpers/structuredDataHelper': {
        getProductSchema: function () { return 'schema'; }
    },
    'dw/web/Resource': {
        msg: function () {
            return 'some string';
        }
    },
    'dw/catalog/CatalogMgr': {
        getCategory: stubCategoryMock
    },
    'dw/catalog/ProductSearchModel': stubSearchModel,
    'dw/catalog/ProductMgr': {
        getProduct: stubGetProduct
    },
    'dw/experience/PageMgr': {
        getPage: stubGetPage
    },
    'dw/util/HashMap': function () {
        this.isHashMap = true;
    }

});
mockSuperModule.create(baseHelper);
var productHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/productHelpers', {
    'dw/system/Site': Site,
    '*/cartridge/scripts/util/collections': mockCollections,
    '*/cartridge/scripts/factories/product': {
        get: stubProductFactoryGet
    },
    '*/cartridge/scripts/helpers/pageMetaHelper': {
        setPageMetaData: function () { },
        setPageMetaTags: function () { }
    },
    'dw/web/URLUtils': {
        url: function () { return 'some url'; }
    },
    '*/cartridge/scripts/helpers/structuredDataHelper': {
        getProductSchema: function () { return 'schema'; }
    },
    'dw/campaign/PromotionMgr': {
        activeCustomerPromotions: {
            getProductPromotions: function () { return 'promotions'; }
        }
    }
});
describe('Helpers - Product', function () {
    describe('getMaxOrderQuantity: when product is not master', function () {
        it('should set the value of maxOrderquantity when product level attribute is empty and present in master', function () {
            var productModelmock = {
                master: false,
                isVariant: function () {
                    return true;
                },
                availabilityModel: { inventoryRecord: { ATS: { value: 100 } } },
                custom: {
                    maxPurchaseQuantity: null
                },
                masterProduct: { custom: { maxPurchaseQuantity: 8 } }
            };
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'productMaxPurchaseQuantity') {
                        return 9;
                    }
                    return true;
                }
            });
            assert.equal(productHelpers.getMaxOrderQuantity(productModelmock, 8), 8);
        });
        it('should set the value of maxOrderquantity when  product level attribute is present', function () {
            var productModelmock = {
                master: false,
                isVariant: function () {
                    return true;
                },
                availabilityModel: { inventoryRecord: { ATS: { value: 100 } } },
                custom: {
                    maxPurchaseQuantity: 5
                },
                masterProduct: { custom: { maxPurchaseQuantity: 8 } }
            };
            assert.equal(productHelpers.getMaxOrderQuantity(productModelmock, 5), 5);
        });

        it('should set the value of maxOrderquantity when both product and master product attribute is empty', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'productMaxPurchaseQuantity') {
                        return 9;
                    }
                    return true;
                }
            });
            var productModelmock = {
                master: false,
                isVariant: function () {
                    return true;
                },
                availabilityModel: { inventoryRecord: { ATS: { value: 100 } } },
                custom: {
                    maxPurchaseQuantity: null
                },
                masterProduct: { custom: { maxPurchaseQuantity: null } }
            };
            assert.equal(productHelpers.getMaxOrderQuantity(productModelmock, 9), 9);
        });
    });
    describe('getMaxOrderQuantity: when the product is master', function () {
        it('should set the value of maxOrderquantity when product level attribute is present', function () {
            var productModelmock = {
                master: true,
                availabilityModel: { inventoryRecord: { ATS: { value: 100 } } },
                custom: {
                    maxPurchaseQuantity: 5
                }
            };
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'productMaxPurchaseQuantity') {
                        return 9;
                    }
                    return true;
                }
            });
            assert.equal(productHelpers.getMaxOrderQuantity(productModelmock, 5), 9);
        });

        it('should set the value of maxOrderquantity when product level attribute is absent', function () {
            var productModelmock = {
                master: true,
                availabilityModel: { inventoryRecord: { ATS: { value: 100 } } },
                custom: {
                    maxPurchaseQuantity: null
                }
            };
            Site.getCurrent.returns({
                getCustomPreferenceValue: function (a) {
                    if (a === 'productMaxPurchaseQuantity') {
                        return 9;
                    }
                    return true;
                }
            });
            assert.equal(productHelpers.getMaxOrderQuantity(productModelmock, 9), 9);
        });
    });
    describe('showProductPage() function', function () {
        var renderSpy = sinon.spy();
        var res = { render: renderSpy };
        var apiProductMock = {
            variant: true,
            masterProduct: {
                primaryCategory: categoryMock
            },
            primaryCategoryMock: categoryMock
        };

        beforeEach(function () {
            stubProductFactoryGet.reset();
            stubGetProduct.reset();
            renderSpy.reset();
        });

        it('should return a with product/productDetails template', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/productDetails');
        });

        it('should return with canonicalUrl', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.canonicalUrl, 'some url');
        });

        it('should return with product schema json', function () {
            var prodMock = { productType: 'variant', id: '12345' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.schemaData, 'schema');
        });

        it('should with product/bundleDetails template', function () {
            var prodMock = { productType: 'bundle', id: 'bundle' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            productHelpers.showProductPage({}, {});

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/bundleDetails');
        });

        it('should return with product/setDetails template', function () {
            var prodMock = { template: 'product/productDetails' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            productHelpers.showProductPage({}, {}, res);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/productDetails');
        });

        it('should return with productDetails template', function () {
            var prodMock = { productType: 'set', id: 'set' };

            stubProductFactoryGet.returns(prodMock);
            stubGetProduct.returns(apiProductMock);

            productHelpers.showProductPage({}, {}, res);

            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.template, 'product/setDetails');
        });

        it('should return h1Name if a product has both h1Name and productName', function () {
            var productMock = {
                productName: 'some name',
                h1Name: 'test'
            };

            stubProductFactoryGet.returns(productMock);
            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.breadcrumbs[0].htmlValue, 'test');
        });
        it('should return productName if product doesnt have h1Name', function () {
            var productMock = {
                productName: 'some name'
            };

            stubProductFactoryGet.returns(productMock);
            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.breadcrumbs[0].htmlValue, 'some name');
        });
        it('should return undefined if there is no h1Name and productName', function () {
            var productMock = {
            };

            stubProductFactoryGet.returns(productMock);
            var result = productHelpers.showProductPage({}, {});
            assert.equal(result.breadcrumbs[0].htmlValue, null);
        });
    });
    describe('getConfig function', function () {
        var config;
        var setSelectedAttributeValueSpy = sinon.spy();
        var Collection = require('../../../../mocks/dw.util.Collection');
        var params = {};
        var productMock = {
            master: true,
            variationModel: {
                master: true,
                getAllValues: function () {
                    return new Collection([{
                        value: 'blue',
                        ID: 'blue'
                    }]);
                },
                getDefaultVariant: function () {
                },
                getVariationValue: function () {
                    var variationValue = {
                        ID: 'color'
                    };
                    return variationValue;
                },
                productVariationAttributes: [{
                    ID: 'color',
                    displayName: 'color'
                }],
                setSelectedAttributeValue: setSelectedAttributeValueSpy
            },
            optionModel: 'someoptions'
        };
        var productVariablesMock = {
            color: {
                value: 'blue'
            }
        };
        params.variables = productVariablesMock;
        params.options = [];
        params.quantity = 1;
        it('should return config object', function () {
            config = productHelpers.getConfig(productMock, params);
            var expectedConfig = {
                variationModel: productMock.variationModel,
                options: params.options,
                optionModel: productMock.optionModel,
                promotions: 'promotions',
                quantity: params.quantity,
                variables: params.variables,
                apiProduct: productMock,
                productType: 'master'
            };
            assert.deepEqual(config, expectedConfig);
        });
        it('Should retuns default variant on page load  when variant is not pre-selected', function () {
            productMock.variationModel.getAllValues = function () {
                return new Collection([{
                    value: 'blue',
                    ID: 'blue'
                },
                {
                    value: 'red',
                    ID: 'red'
                }]);
            };
            productVariablesMock = {
                prototype: {
                    hasOwnProperty: function () {
                        return {
                            call: function () {
                                return false;
                            }
                        };
                    },
                    color: {
                        value: ['blue', 'red']
                    }

                }
            };
            params.variables = productVariablesMock;
            config = productHelpers.getConfig(productMock, params);
            var expectedConfig = {
                variationModel: productMock.variationModel,
                options: params.options,
                optionModel: productMock.optionModel,
                promotions: 'promotions',
                quantity: params.quantity,
                variables: params.variables,
                apiProduct: productMock,
                productType: 'master'
            };
            assert.deepEqual(config, expectedConfig);
        });
        it('Should return params variables when master is false', function () {
            productMock = {
                master: false,
                variationModel: {
                    master: false,
                    selectedVariant: false
                },
                optionModel: 'someoptions'
            };
            config = productHelpers.getConfig(productMock, params);
            var expectedConfig = {
                variationModel: null,
                options: params.options,
                optionModel: productMock.optionModel,
                promotions: 'promotions',
                quantity: params.quantity,
                variables: params.variables,
                apiProduct: productMock,
                productType: 'standard'
            };
            assert.deepEqual(config, expectedConfig);
        });
    });
});
