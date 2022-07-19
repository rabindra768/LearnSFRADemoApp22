'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../../../mocks/dw.util.Collection');

var stubGetImage = sinon.stub();

var representedVariationValuesMock = {
    getImage: stubGetImage,
    value: 'someColor',
    ID: 'someColorID',
    description: 'someDescription',
    displayValue: 'someDisplayValue'
};

var searchHitMock = {
    getRepresentedVariationValues: function () {
        return new ArrayList([representedVariationValuesMock]);
    },
    product: {
        masterProduct: {
            ID: 'master'
        }
    }
};

var searchHitMock2 = {
    getRepresentedVariationValues: function () {
        return new ArrayList([representedVariationValuesMock]);
    },
    hitType: 'variationGroup',
    HIT_TYPE_VARIATION_GROUP: 'variationGroup',
    product: {
        masterProduct: {
            ID: 'master'
        }
    }
};

var ATTRIBUTE_NAME = 'color';

var variablesMock = {
    [ATTRIBUTE_NAME]: {
        value: 'someColor'
    }
};

var variablesMock1 = {
    [ATTRIBUTE_NAME]: {
        value: null
    }
};

describe('search variation attributes decorator', function () {
    var collections = proxyquire('../../../../../../cartridges/app_storefront_base/cartridge/scripts/util/collections', {
        'dw/util/ArrayList': ArrayList
    });

    var variationAttributes = proxyquire('../../../../../../cartridges/app_capri_core/cartridge/models/product/decorators/searchVariationAttributes', {
        '*/cartridge/scripts/util/collections': collections,
        'dw/web/URLUtils': {
            url: function () {
                return 'someURL';
            }
        },
        '*/cartridge/config/ConfigMgr': {
            getPreferences: function () {
                return {
                    useMasterUrlInSearch: true
                };
            }
        }
    });

    it('should create a property on the passed in object called variationAttributes when there is no selected color', function () {
        var object = {};
        stubGetImage.returns({
            alt: 'alt',
            URL: {
                toString: function () {
                    return 'string url';
                }
            },
            title: 'someTitle'
        });
        variationAttributes(object, searchHitMock2, variablesMock1);

        assert.equal(object.variationAttributes.length, 1);
        assert.equal(object.variationAttributes[0].attributeId, 'color');
        assert.equal(object.variationAttributes[0].id, 'color');
        assert.isTrue(object.variationAttributes[0].swatchable);
        assert.equal(object.variationAttributes[0].values.length, 1);
        assert.equal(object.variationAttributes[0].values[0].id, 'someColorID');
        assert.equal(object.variationAttributes[0].values[0].description, 'someDescription');
        assert.equal(object.variationAttributes[0].values[0].displayValue, 'someDisplayValue');
        assert.equal(object.variationAttributes[0].values[0].value, 'someColor');
        assert.isTrue(object.variationAttributes[0].values[0].selectable);
        assert.isFalse(object.variationAttributes[0].values[0].selected);
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].alt, 'alt');
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].url, 'string url');
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].title, 'someTitle');
        assert.equal(object.variationAttributes[0].values[0].url, 'someURL');
    });

    it('should create a property on the passed in object called variationAttributes when color is selected', function () {
        var object = {};
        stubGetImage.returns({
            alt: 'alt',
            URL: {
                toString: function () {
                    return 'string url';
                }
            },
            title: 'someTitle'
        });
        variationAttributes(object, searchHitMock, variablesMock);

        assert.equal(object.variationAttributes.length, 1);
        assert.equal(object.variationAttributes[0].attributeId, 'color');
        assert.equal(object.variationAttributes[0].id, 'color');
        assert.isTrue(object.variationAttributes[0].swatchable);
        assert.equal(object.variationAttributes[0].values.length, 1);
        assert.equal(object.variationAttributes[0].values[0].id, 'someColorID');
        assert.equal(object.variationAttributes[0].values[0].description, 'someDescription');
        assert.equal(object.variationAttributes[0].values[0].displayValue, 'someDisplayValue');
        assert.equal(object.variationAttributes[0].values[0].value, 'someColor');
        assert.isTrue(object.variationAttributes[0].values[0].selectable);
        assert.isTrue(object.variationAttributes[0].values[0].selected);
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].alt, 'alt');
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].url, 'string url');
        assert.equal(object.variationAttributes[0].values[0].images.swatch[0].title, 'someTitle');
        assert.equal(object.variationAttributes[0].values[0].url, 'someURL');
    });

    it('should handle no images returned by the api for represented variation values', function () {
        var object = {};
        stubGetImage.returns(null);
        variationAttributes(object, searchHitMock, variablesMock);

        assert.equal(object.variationAttributes.length, 1);
        assert.deepEqual(object.variationAttributes[0].values[0], {});
    });
});

