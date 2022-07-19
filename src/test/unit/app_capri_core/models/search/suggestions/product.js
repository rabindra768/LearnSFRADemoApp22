'use strict';
var sinon = require('sinon');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var preferences = {
    suggestionsActionEnpoint: 'Product-Show',
    imageSize: 'medium'
};

var mockSuperModule = require('../../../../../mocks/modules/mockModuleSuperModule');
var baseProductSuggestions = proxyquire('app_storefront_base/cartridge/models/search/suggestions/product', {
    '*/cartridge/config/preferences': preferences
});
mockSuperModule.create(baseProductSuggestions);
global.request.session = {
    currency: {
        currencyCode: 'US'
    }
};

describe('Product - Suggestions model in app_capri_core', function () {
    var nextProductStub = sinon.stub();
    var nextPhraseStub = sinon.stub();
    var urlStub = sinon.stub();

    var ProductSuggestions = proxyquire('app_capri_core/cartridge/models/search/suggestions/product', {
        '*/cartridge/config/preferences': preferences,
        'dw/web/URLUtils': { url: urlStub },
        '*/cartridge/scripts/helpers/pricing': {
            getIndividualProductsPrices: function () {
                return '';
            },
            getSetPrice: function () {
                return '$10';
            }
        },
        '*/cartridge/scripts/factories/price': {}
    });

    var variationModel = {
        defaultVariant: {
            getImage: function () {
                return {
                    URL: {
                        toString: function () { return 'image url'; }
                    }
                };
            }
        }
    };
    var product1 = {
        productSearchHit: {
            product: {
                name: 'Content 1',
                brand: 'MK',
                ID: 1,
                master: true,
                variationModel: variationModel,
                priceModel: '$25'
            }
        }
    };
    var product2 = {
        productSearchHit: {
            product: {
                name: 'Content 2',
                brand: 'MichaelKors',
                ID: 2,
                master: true,
                variationModel: variationModel,
                priceModel: {
                    maxPrice: {
                        toFormattedString: function () {
                            return '$10';
                        }
                    }
                }
            }
        }
    };
    var product3 = {
        productSearchHit: {
            product: {
                name: 'Content 3',
                brand: 'MichaelkorsPremium',
                ID: 3,
                master: true,
                productSet: true,
                variationModel: variationModel,
                priceModel: '$15'
            }
        }
    };
    var phrase1 = {
        exactMatch: true,
        phrase: 'phrase 1'
    };
    var phrase2 = {
        exactMatch: false,
        phrase: 'phrase 2'
    };

    var productSuggestions;

    beforeEach(function () {
        // Ideally onCall 0 & 1 will be utilized by base file i.e. product.js from app_storefront_base
        urlStub.onCall(0).returns('url1');
        urlStub.onCall(1).returns('url2');
        urlStub.onCall(2).returns('url1');
        urlStub.onCall(3).returns('url2');

        nextProductStub.onCall(0).returns(product1);
        nextProductStub.onCall(1).returns(product2);
        nextProductStub.onCall(2).returns(product1);
        nextProductStub.onCall(3).returns(product2);

        nextPhraseStub.onCall(0).returns(phrase1);
        nextPhraseStub.onCall(1).returns(phrase2);
        nextPhraseStub.onCall(2).returns(phrase1);
        nextPhraseStub.onCall(3).returns(phrase2);
    });

    afterEach(function () {
        urlStub.reset();
        nextProductStub.reset();
        nextPhraseStub.reset();
    });

    var suggestions = {
        productSuggestions: {
            searchPhraseSuggestions: {
                suggestedPhrases: {
                    hasNext: function () { return true; },
                    next: nextPhraseStub
                }
            },
            suggestedProducts: {
                hasNext: function () { return true; },
                next: nextProductStub,
                asList: function () {
                    return {
                        length: 5
                    };
                }
            },
            hasSuggestions: function () { return true; }
        }
    };

    it('should return a ProductSuggestions instance for master product', function () {
        productSuggestions = new ProductSuggestions(suggestions, 2);
        assert.deepEqual(productSuggestions, {
            available: true,
            phrases: [{
                exactMatch: true,
                value: 'phrase 1'
            }, {
                exactMatch: false,
                value: 'phrase 2'
            }],
            products: [{
                brand: 'MK',
                imageUrl: 'image url',
                name: 'Content 1',
                price: '$25',
                url: 'url1'
            }, {
                brand: 'MichaelKors',
                imageUrl: 'image url',
                name: 'Content 2',
                price: '$10',
                url: 'url2'
            }],
            showViewAll: true,
            viewAllPhrase: 'phrase 1'
        });
    });
    it('should return a ProductSuggestions instance for product set', function () {
        nextProductStub.onCall(3).returns(product3);
        productSuggestions = new ProductSuggestions(suggestions, 2);
        assert.deepEqual(productSuggestions, {
            available: true,
            phrases: [
                { exactMatch: true,
                    value: 'phrase 1'
                }, {
                    exactMatch: false,
                    value: 'phrase 2'
                }
            ],
            products: [
                {
                    brand: 'MK',
                    imageUrl: 'image url',
                    name: 'Content 1',
                    price: '$25',
                    url: 'url1'
                }, {
                    brand: 'MichaelkorsPremium',
                    imageUrl: 'image url',
                    name: 'Content 3',
                    price: '$10',
                    url: 'url2'
                }
            ],
            showViewAll: true,
            viewAllPhrase: 'phrase 1'
        });
    });
});
