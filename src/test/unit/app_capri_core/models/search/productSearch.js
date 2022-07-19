'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var mockCollections = require('../../../../mocks/util/collections');
var Site = require('dw-api-mock/dw/system/Site');

describe('ProductSearch model', function () {
    var apiProductSearch;
    var httpParams = {};
    var result = '';
    var endpointSearchShow = 'Search-ShowAjax';
    var showMoreEndpoint = 'Search-UpdateGrid';
    var pluckValue = 'plucked';
    var refinementValues = [{
        value: 1,
        selected: false
    }, {
        value: 2,
        selected: true
    }, {
        value: 3,
        selected: false
    }];
    var spySetPageSize = sinon.spy();
    var spySetStart = sinon.spy();
    var stubAppendPaging = sinon.stub();
    var stubAppendQueryParams = sinon.stub();
    stubAppendQueryParams.returns({ toString: function () {} });
    var pagingModelInstance = {
        appendPaging: stubAppendPaging,
        getEnd: function () { return 10; },
        setPageSize: spySetPageSize,
        setStart: spySetStart
    };
    var stubPagingModel = sinon.stub();
    stubPagingModel.returns(pagingModelInstance);
    var ConfigMgr = {
        getPreferences: sinon.stub()
    };
    var preferences = { refinementFilterDefaultCount: 5 };
    ConfigMgr.getPreferences.returns(preferences);
    function getProductSearch(siteArgument) {
        return proxyquire('app_capri_core/cartridge/models/search/productSearch', {
            '*/cartridge/scripts/util/collections': {
                map: mockCollections.map,
                pluck: function () { return pluckValue; }
            },
            '*/cartridge/scripts/factories/searchRefinements': {
                get: function () { return refinementValues; }
            },
            '*/cartridge/models/search/productSortOptions': proxyquire('../../../../../cartridges/app_storefront_base/cartridge/models/search/productSortOptions', {
                '*/cartridge/scripts/util/collections': {
                    map: mockCollections.map
                },
                '*/cartridge/scripts/helpers/urlHelpers': {
                    appendQueryParams: function () {}
                }
            }),
            '*/cartridge/scripts/helpers/urlHelpers': {
                appendQueryParams: stubAppendQueryParams
            },
            '*/cartridge/scripts/helpers/searchHelpers': {
                getBannerImageUrl: function (category) { return (category && category.weAreMockingThings) || ''; }
            },
            'dw/web/URLUtils': {
                url: function (endpoint, param, value) { return [endpoint, param, value].join(' '); }
            },
            'dw/web/PagingModel': stubPagingModel,
            '*/cartridge/config/ConfigMgr': ConfigMgr,
            'dw/system/Site': {
                getCurrent: function () { return siteArgument; }
            },
            'dw/catalog/CatalogMgr': {
                getSiteCatalog: function () {
                    return { getRoot: function () { return; } };
                }
            }
        });
    }
    var currentSite1 = Site.getCurrent();
    currentSite1.setCustomPreferenceValue('mobileLoadMorePageSize', 10);
    currentSite1.setCustomPreferenceValue('desktopLoadMorePageSize', 10);
    currentSite1.setCustomPreferenceValue('mobileLazyLoadPageSize', 10);
    currentSite1.setCustomPreferenceValue('desktopLazyLoadPageSize', 10);
    var ProductSearch = getProductSearch(currentSite1);

    describe('.getRefinements()', function () {
        var displayName = 'zodiac sign';
        var categoryRefinement = { cat: 'catRefinement' };
        var attrRefinement = { attr: 'attrRefinement' };

        beforeEach(function () {
            apiProductSearch = {
                category: {
                    custom: {
                        priceRefineOpenAccordionDisplay: true,
                        attributeRefineOpenAccordionDisplay: [{ definition: { attributeID: '' }
                        }] }
                },
                isCategorySearch: false,
                refinements: {
                    refinementDefinitions: [{
                        displayName: displayName,
                        categoryRefinement: categoryRefinement,
                        attributeRefinement: attrRefinement,
                        values: refinementValues
                    }],
                    getAllRefinementValues: function () {}
                },
                url: function () { return 'http://some.url'; }
            };
        });

        it('should return refinements with a display name', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.refinements[0].displayName, displayName);
        });

        it('should return refinements with a categoryRefinement value', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.refinements[0].isCategoryRefinement, categoryRefinement);
        });

        it('should return refinements with an attribute refinement value', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.refinements[0].isAttributeRefinement, attrRefinement);
        });

        it('should return an object with refinement values', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.refinements[0].values, refinementValues);
        });
    });
    describe('.getPhrases()', function () {
        it('should return suggestion phrase when search suggestion is available in productSearch', function () {
            var nextPhraseStub = sinon.stub();
            var phrase1 = {
                phrase: 'phrase 1'
            };
            nextPhraseStub.onCall(0).returns(phrase1);
            var searchSuggestionsMock = {
                hasSuggestedPhrases: sinon.stub(),
                suggestedPhrases: {
                    hasNext: sinon.stub(),
                    next: nextPhraseStub
                }
            };
            searchSuggestionsMock.suggestedPhrases.hasNext.onCall(0).returns(true);
            searchSuggestionsMock.suggestedPhrases.hasNext.onCall(1).returns(false);
            searchSuggestionsMock.hasSuggestedPhrases.returns(true);
            apiProductSearch = { url: function () { return 'http://some.url'; }, searchPhraseSuggestions: searchSuggestionsMock };
            httpParams = {};
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.isTrue(result.isSearchSuggestionsAvailable);
            assert.isNotNull(result.suggestionPhrases);
        });
    });
    describe('.getSelectedFilters()', function () {
        beforeEach(function () {
            apiProductSearch = {
                isCategorySearch: false,
                category: {
                    custom: true
                },
                refinements: {
                    refinementDefinitions: [{}],
                    getAllRefinementValues: function () {}
                },
                url: function () { return 'http://some.url'; }
            };
        });

        it('should retrieve filter values that have been selected', function () {
            var selectedFilter = refinementValues.find(function (value) { return value.selected === true; });
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.selectedFilters[0], selectedFilter);
        });

        it('should retrieve filter values that have been selected', function () {
            var selectedFilter = refinementValues.find(function (value) { return value.selected === true; });
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.selectedFilters[0], selectedFilter);
        });
    });

    describe('.getResetLink()', function () {
        var expectedLink = '';

        beforeEach(function () {
            apiProductSearch = {
                categorySearch: false,
                category: {
                    custom: true
                },
                refinements: {
                    refinementDefinitions: []
                },
                url: function () { return 'http://some.url'; }
            };

            httpParams = {
                cgid: 'cat123',
                q: 'keyword'
            };
        });

        it('should return a reset link for keyword searches', function () {
            expectedLink = [endpointSearchShow, 'q', httpParams.q].join(' ');
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.resetLink, expectedLink);
        });

        it('should return a reset link for category searches', function () {
            apiProductSearch.categorySearch = true;
            expectedLink = [endpointSearchShow, 'cgid', httpParams.cgid].join(' ');
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.resetLink, expectedLink);
        });
    });

    describe('.getBannerImageUrl()', function () {
        it('should use the searchHelper to resolve the banner URL', function () {
            apiProductSearch = {
                refinements: {
                    refinementDefinitions: []
                },
                url: function () { return 'http://some.url'; },
                category: {
                    weAreMockingThings: 'withMockData'
                }
            };
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.bannerImageUrl, 'withMockData');
        });
    });

    describe('permaLink & showMoreUrl', function () {
        var expectedUrl = 'some url';
        var expectedPermalink = 'permalink url';
        beforeEach(function () {
            apiProductSearch = {
                isCategorySearch: false,
                category: {
                    custom: true
                },
                refinements: {
                    refinementDefinitions: []
                },
                url: function () { return showMoreEndpoint; }
            };
            httpParams = {
                start: 10,
                sz: 12
            };
            stubAppendPaging.returns(expectedUrl);
        });
        it('should produce a permalink URL when customLoadMore is disabled and should return a url string if not on final results page', function () {
            apiProductSearch.count = 140;
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.permalink, expectedPermalink);
            assert.equal(result.showMoreUrl, expectedUrl);
        });
        it('should produce a permalink URL when customLoadMore is disabled and should return a empty url string if if results last page', function () {
            apiProductSearch.count = 3;
            expectedUrl = '';
            httpParams = {
                sz: '144'   // for pagesize > defaultPageSize in getShowMoreConfig
            };
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.permalink, expectedPermalink);
            assert.equal(result.showMoreUrl, expectedUrl);
        });
    });

    describe('.getPagingModel()', function () {
        beforeEach(function () {
            apiProductSearch = {
                isCategorySearch: false,
                category: {
                    custom: false
                },
                refinements: {
                    refinementDefinitions: []
                },
                url: function () { return 'http://some.url'; }
            };
        });

        it('should call the PagingModel.setStart() method', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.isTrue(spySetStart.called);
        });

        it('should call the PagingModel.setPageSize() method', function () {
            result = new ProductSearch(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.isTrue(spySetPageSize.called);
        });
    });

    describe('mobilePermalink & desktopPermalink - customLoadMore enabled', function () {
        var currentSite = Site.getCurrent();
        currentSite.setCustomPreferenceValue('mobileLoadMorePageSize', 36);
        currentSite.setCustomPreferenceValue('desktopLoadMorePageSize', 72);
        currentSite.setCustomPreferenceValue('mobileLazyLoadPageSize', 12);
        currentSite.setCustomPreferenceValue('desktopLazyLoadPageSize', 24);
        var expectedPermalink = 'permalink url';
        var mockToString = function () { return expectedPermalink; };
        stubAppendQueryParams.returns({ toString: mockToString });
        showMoreEndpoint = 'Search-Show';
        httpParams = {
            start: '100',
            sz: '12'
        };
        var ProductSearch1 = getProductSearch(currentSite);
        it('should return desktopShowMoreConfig object when customLoadMore is enabled', function () {
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.desktopShowMoreConfig, { url: 'some url', showLoadMore: true, pageSize: 144, isFirstLoad: false });
        });
        it('should return mobileShowMoreConfig object when customLoadMore is enabled', function () {
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.deepEqual(result.mobileShowMoreConfig, { url: 'some url', showLoadMore: true, pageSize: 144 });
        });
        it('should produce a permalink & mobilePermalink URL when customLoadMore is enabled', function () {
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.permalink, expectedPermalink);
            assert.equal(result.mobilePermalink, expectedPermalink);
        });
        it('should produce a permalink & mobilePermalink URL when pageSize greater than hitscount', function () {
            apiProductSearch.count = 10;
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.permalink, expectedPermalink);
            assert.equal(result.mobilePermalink, expectedPermalink);
        });
        it('should produce a permalink & mobilePermalink URL when params returns zero', function () {
            httpParams = {
                start: '0',
                sz: '0'
            };
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.equal(result.permalink, expectedPermalink);
            assert.equal(result.mobilePermalink, expectedPermalink);
        });
        it('should append sz query param to a url = to start and default page size', function () {
            result = new ProductSearch1(apiProductSearch, httpParams, 'sorting-rule-1', [], {});
            assert.isTrue(stubAppendQueryParams.calledWith(showMoreEndpoint));
            assert.deepEqual(stubAppendQueryParams.args[0][1], {
                start: '0',
                // start of 100 + default page size of 12
                sz: 112
            });
        });
    });
});
