'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var sinon = require('sinon');
var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseSearchHelpers = proxyquire('app_storefront_base/cartridge/scripts/helpers/searchHelpers', {
    'dw/catalog/CatalogMgr': {
        getCategory: function () { }
    },
    '*/cartridge/scripts/search/search': {
        setProductProperties: function () { },
        addRefinementValues: function () { }
    }
});

mockSuperModule.create(baseSearchHelpers);
var mockurl = sinon.stub();
var productSearchStub = sinon.stub();
var getSuggestedPhrasesSpy = sinon.spy();
var setSearchPhraseSpy = sinon.spy();
var searchSpy = sinon.spy();
var nextPhraseStub = sinon.stub();
var hasNextStub = sinon.stub();
var hasSuggestedPhrasesstub = sinon.stub();
var catalogMgrMock;
var pageMgrMock;
var categoryMock = {
    parent: {
        ID: 'root'
    },
    template: 'rendering/category/categoryproducthits'
};

catalogMgrMock = {
    getCategory: sinon.stub()
};
catalogMgrMock.getCategory.returns(categoryMock);

pageMgrMock = {
    getPage: sinon.stub()
};
var productSearchModelMock = {
    getSuggestedPhrases: getSuggestedPhrasesSpy,
    search: searchSpy,
    setSearchPhrase: setSearchPhraseSpy,

    getProductIDs: function () {
        return {
            length: 0
        };
    },
    categorySearch: false,
    refinedCategorySearch: false,
    getSearchPhraseSuggestions: function () {
        return {

            getSuggestedPhrases: function () {
                return {
                    hasNext: hasNextStub,
                    next: nextPhraseStub
                };
            },
            hasSuggestedPhrases: hasSuggestedPhrasesstub
        };
    },
    getSearchRedirect: function () {
        return {
            getLocation: function () {
                return 'some value';
            }
        };
    },
    category: categoryMock
};

var searchHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/searchHelpers', {
    'dw/experience/PageMgr': pageMgrMock,
    'dw/util/HashMap': function () {
        this.isHashMap = true;
    },
    categorySearch: true,
    refinedCategorySearch: true,
    '*/cartridge/scripts/helpers/pageMetaHelper': {
        setPageMetaTags: function () {
            return;
        },
        setPageMetaData: function () {
            return;
        }
    },
    '*/cartridge/scripts/helpers/structuredDataHelper': {
        getListingPageSchema: function () {
            return 'some schema';
        }
    },
    '*/cartridge/models/search/productSearch': productSearchStub,
    '*/cartridge/scripts/reportingUrls': {
        getProductSearchReportingURLs: function () {
            return ['something', 'something else'];
        }
    },
    '*/cartridge/scripts/search/search': {
        setProductProperties: function () {
            return;
        },
        addRefinementValues: function () {
            return;
        }
    },
    'dw/catalog/CatalogMgr': {
        getSortingOptions: function () {
            return;
        },
        getSiteCatalog: function () {
            return { getRoot: function () { return; } };
        },
        getSortingRule: function (rule) {
            return rule;
        },
        getCategory: function () {
            return { ID: 'mens', online: true };
        }
    },
    'dw/catalog/ProductSearchModel': function () {
        return productSearchModelMock;
    },
    'dw/web/URLUtils': {
        url: mockurl
    }
});
describe('searchHelpers', function () {
    var base;
    describe('getCategoryBreadCrumbs', function () {
        var category;
        var breadcrumbs;
        it('should return default breadcrumbs when category is null', function () {
            mockurl.returns('someurl');
            category = null;
            breadcrumbs = 'mockBreadcrumbs';
            base = searchHelpers.getCategoryBreadcrumbs(category, breadcrumbs);
            assert.equal(base, 'mockBreadcrumbs');
        });
        it('should return breadcrumbs when parent id is root', function () {
            mockurl.returns('someurl');
            category = {
                parent: {
                    ID: 'root'
                },
                ID: 'mockCategoryId',
                displayName: 'mockDisplay'
            };
            breadcrumbs = [];
            base = searchHelpers.getCategoryBreadcrumbs(category, breadcrumbs);
            assert.deepEqual(base, [{ htmlValue: 'mockDisplay', url: 'someurl' }]);
        });
        it('should return breadcrumbs when parent id is not root', function () {
            mockurl.returns('someurl');
            category = {
                parent: {
                    ID: 'mockId1'
                },
                ID: 'mockCategoryId1',
                displayName: 'mockDisplay1'
            };
            breadcrumbs = [];
            base = searchHelpers.getCategoryBreadcrumbs(category, breadcrumbs);
            assert.deepEqual(base, [{ htmlValue: 'mockDisplay1', url: 'someurl' }, { htmlValue: undefined, url: 'someurl' }]);
        });
    });
    describe('search', function () {
        var res = {
            cachePeriod: '',
            cachePeriodUnit: '',
            personalized: false
        };
        var mockRequest1 = {
            querystring: {}
        };
        var mockRequest2 = { querystring: { q: 'someValue' } };
        var mockRequest3 = { querystring: { cgid: 'someCategory', preferences: 'preferences', pmin: 'pmin', pmax: 'pmax' } };

        afterEach(function () {
            productSearchStub.reset();
            nextPhraseStub.reset();
            searchSpy.reset();
            setSearchPhraseSpy.reset();
            hasNextStub.reset();
            hasSuggestedPhrasesstub.reset();
        });
        it('should category search', function () {
            productSearchStub.returns({
                isCategorySearch: true,
                isRefinedCategorySearch: false
            });
            productSearchModelMock.categorySearch = true;
            productSearchModelMock.refinedCategorySearch = false;
            var result = searchHelpers.search(mockRequest1, res);

            assert.isTrue(searchSpy.calledOnce);
            assert.equal(result.maxSlots, 4);
            assert.deepEqual(result.category, {
                parent: {
                    ID: 'root'
                },
                template: 'rendering/category/categoryproducthits'
            });
            assert.equal(result.categoryTemplate, 'rendering/category/categoryproducthits');
            assert.equal(result.reportingURLs.length, 2);
            assert.isDefined(result.canonicalUrl);
            assert.isDefined(result.schemaData);
        });

        it('should search', function () {
            productSearchStub.returns({
                isCategorySearch: false,
                isRefinedCategorySearch: false
            });
            nextPhraseStub.returns({
                exactMatch: false,
                phrase: 'GOLD'
            });
            hasSuggestedPhrasesstub.returns(true);
            hasNextStub.onCall(0).returns(true);
            hasNextStub.onCall(1).returns(false);
            productSearchModelMock.categorySearch = false;
            productSearchModelMock.refinedCategorySearch = false;
            categoryMock = null;

            var result = searchHelpers.search(mockRequest1, res);

            assert.isTrue(searchSpy.calledTwice);
            assert.isTrue(setSearchPhraseSpy.calledOnce);
            assert.equal(result.maxSlots, 4);
            assert.equal(result.category, null);
            assert.equal(result.categoryTemplate, null);
            assert.equal(result.reportingURLs.length, 2);
        });
        it('should search and exactmatch is true and hasSuggestedPhrasesstub is false', function () {
            productSearchStub.returns({
                isCategorySearch: false,
                isRefinedCategorySearch: false
            });
            nextPhraseStub.returns({
                exactMatch: true,
                phrase: 'GOLD'
            });
            hasSuggestedPhrasesstub.returns(false);
            hasNextStub.onCall(0).returns(true);
            hasNextStub.onCall(1).returns(false);
            productSearchModelMock.categorySearch = false;
            productSearchModelMock.refinedCategorySearch = false;
            categoryMock = null;

            var result = searchHelpers.search(mockRequest1, res);

            assert.isFalse(searchSpy.calledTwice);
            assert.isFalse(setSearchPhraseSpy.calledOnce);
            assert.equal(result.maxSlots, 4);
            assert.equal(result.category, null);
            assert.equal(result.categoryTemplate, null);
            assert.equal(result.reportingURLs.length, 2);
        });
        it('should get a search redirect url ', function () {
            var result = searchHelpers.search(mockRequest2);

            assert.equal(result.searchRedirect, 'some value');
            assert.isTrue(searchSpy.notCalled);
            assert.equal(result.maxSlots, null);
        });

        it('should search with query string params', function () {
            mockurl.returns({
                append: function () {
                    return 'some appened URL';
                }
            });
            hasNextStub.onCall(0).returns(true);
            hasNextStub.onCall(1).returns(false);
            nextPhraseStub.returns({
                exactMatch: false,
                phrase: 'GOLD'
            });
            hasSuggestedPhrasesstub.returns(true);
            searchHelpers.search(mockRequest3, res);
            assert.isTrue(searchSpy.called);
            assert.isTrue(setSearchPhraseSpy.calledOnce);
        });
        it('should search with query string params and exactmatch is a true', function () {
            mockurl.returns({
                append: function () {
                    return 'some appened URL';
                }
            });
            hasNextStub.onCall(0).returns(true);
            hasNextStub.onCall(1).returns(false);
            nextPhraseStub.returns({
                exactMatch: true,
                phrase: 'GOLD'
            });
            hasSuggestedPhrasesstub.returns(true);
            searchHelpers.search(mockRequest3, res);
            assert.isFalse(searchSpy.calledTwice);
            assert.isFalse(setSearchPhraseSpy.calledOnce);
        });
    });
});
