'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var expect = require('chai').expect;
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var SearchSuggestionConfig = require('app_capri_core/cartridge/config/searchSuggestionConfig');

var Site = {
    getCurrent: sinon.stub()
};

var maxSuggestionsMock = {
    'categorySuggestions': 4,
    'contentSuggestions': 4,
    'productSuggestions': 4,
    'recentSuggestions': 4,
    'popularSuggestions': 4,
    'brandSuggestions': 4
};

var searchSuggestionConfigMock = {
    templateConfig: {
        'doyoumean': 'search/components/doYouMeanSuggestions.isml',
        'category': 'search/components/categorySuggestions.isml',
        'recent': 'search/components/recentSuggestions.isml',
        'popular': 'search/components/popularSuggestions.isml',
        'brand': 'search/components/brandSuggestions.isml',
        'content': 'search/components/contentSuggestions.isml',
        'product': 'search/components/productSuggestions.isml'
    },
    searchSuggestionComponents: [
        'doyoumean',
        'category',
        'recent',
        'popular',
        'brand',
        'content',
        'product'
    ]
};

var searchSuggestionTemplatesMock = [
    'search/components/doYouMeanSuggestions.isml',
    'search/components/categorySuggestions.isml',
    'search/components/recentSuggestions.isml',
    'search/components/popularSuggestions.isml',
    'search/components/brandSuggestions.isml',
    'search/components/contentSuggestions.isml',
    'search/components/productSuggestions.isml'
];

var suggestionHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/suggestionHelpers', {
    'dw/system/Site': Site,
    '*/cartridge/config/searchSuggestionConfig': SearchSuggestionConfig
});

describe('Helpers - Suggestion', function () {
    beforeEach(function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'maxSuggestions') {
                    const jsonMock = '{"categorySuggestions":4, "contentSuggestions":4, "productSuggestions":4, "recentSuggestions":4, "popularSuggestions":4, "brandSuggestions":4}';
                    return jsonMock;
                }
                return null;
            }
        });
    });
    var searchComponents = '{"searchSuggestionComponents":["doyoumean","category","recent","popular","brand","content","product"]}';

    describe('getMaxSearchSuggestion: Checking the returned values', function () {
        it('Should check when custom preference does not exist', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function () {
                    return null;
                }
            });
            var result = suggestionHelpers.getMaxSearchSuggestion();
            expect(result).to.be.equal(undefined);
        });
        it('Should check when custom preference exists', function () {
            assert.isObject(suggestionHelpers.getMaxSearchSuggestion());
            assert.deepEqual(suggestionHelpers.getMaxSearchSuggestion(), maxSuggestionsMock);
        });
    });

    describe('getSearchSuggestionConfig: Checking the returned value', function () {
        it('Should check when template is defined', function () {
            assert.isObject(suggestionHelpers.getSearchSuggestionConfig());
            assert.deepEqual(suggestionHelpers.getSearchSuggestionConfig(), searchSuggestionConfigMock);
        });

        it('Should check when template is not defined', function () {
            expect(suggestionHelpers.getSearchSuggestionConfig()).to.not.equal(searchSuggestionConfigMock);
        });
    });

    describe('getSearchSuggestionComponents: Checking the returned value', function () {
        it('Should check when components are defined', function () {
            assert.isArray(suggestionHelpers.getSearchSuggestionComponents(searchComponents));
            assert.deepEqual(suggestionHelpers.getSearchSuggestionComponents(searchComponents), searchSuggestionTemplatesMock);
        });

        it('Should check when components is not defined', function () {
            Site.getCurrent.returns({
                getCustomPreferenceValue: function () {
                    return null;
                }
            });

            assert.isArray(suggestionHelpers.getSearchSuggestionComponents(searchComponents));
            assert.deepEqual(suggestionHelpers.getSearchSuggestionComponents(searchComponents), searchSuggestionTemplatesMock);
        });
    });
});
