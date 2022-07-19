'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');
var ArrayList = require('../../../../../mocks/dw.util.Collection');
var HashMap = function () {
    return {
        clear: function () {},
        put: sinon.stub()
    };
};

var mockCollections = require('../../../../../mocks/util/collections');
var ATTRIBUTE_NAME = 'color';
var stubGetImage = sinon.stub();

var variablesMock = {
    [ATTRIBUTE_NAME]: {
        value: 'someColor'
    }
};
var variablesMock1 = {};

var representedVariationValuesMock = new ArrayList([{
    ID: 'someColorID',
    value: 'someColor',
    description: 'someDescription',
    getImage: stubGetImage,
    displayValue: 'someDisplayValue'
}]);
var apiProductMock = {};

var variationModelMock = {
    master: {
        id: 'masterID'
    },
    getProductVariationAttribute: function () {
        return {
            attributeID: 'someColor',
            ID: 'someColorID',
            displayName: 'someDisplayValue'
        };
    },
    getAllValues: function () {
        return representedVariationValuesMock;
    },
    hasOrderableVariants: function () {
        return false;
    },
    getSelectedValue: function () {
        return 'someColor';
    },
    getVariants: function () {
        return new ArrayList([{
            getSearchableIfUnavailableFlag: function () {
                return true;
            },
            getAvailabilityModel: function () {
                return {
                    isInStock: function () {
                        return true;
                    }
                };
            }
        }]);
    }
};

var variationModelMock2 = {
    master: {
        id: 'masterID'
    },
    getProductVariationAttribute: function () {
        return {
            attributeID: 'someColor',
            ID: 'someColorID',
            displayName: 'someDisplayValue'
        };
    },
    getAllValues: function () {
        return representedVariationValuesMock;
    },
    hasOrderableVariants: function () {
        return false;
    },
    getSelectedValue: function () {
        return 'someColor';
    },
    getVariants: function () {
        return new ArrayList([{
            getSearchableIfUnavailableFlag: function () {
                return false;
            },
            getAvailabilityModel: function () {
                return {
                    isInStock: function () {
                        return false;
                    }
                };
            }
        }]);
    }
};

var variationModelMock3 = {
    master: {
        id: 'masterID'
    },
    getProductVariationAttribute: function () {
        return {
            attributeID: 'someColor',
            ID: 'someColorID',
            displayName: 'someDisplayValue'
        };
    },
    getAllValues: function () {
        return representedVariationValuesMock;
    },
    hasOrderableVariants: function () {
        return false;
    },
    getSelectedValue: function () {
        return 'someColor';
    },
    getVariants: function () {
        return new ArrayList([{
            getSearchableIfUnavailableFlag: function () {
                return false;
            },
            getAvailabilityModel: function () {
                return {
                    isInStock: function () {
                        return false;
                    }
                };
            }
        },
        {
            getSearchableIfUnavailableFlag: function () {
                return true;
            },
            getAvailabilityModel: function () {
                return {
                    isInStock: function () {
                        return true;
                    }
                };
            }
        }]);
    }
};

describe('search slice variation attributes decorator', function () {
    var variationAttributes = proxyquire('app_capri_core/cartridge/models/product/decorators/searchSliceVariationAttributes', {
        '*/cartridge/scripts/util/collections': mockCollections,
        'dw/web/URLUtils': {
            url: function () {
                return 'someURL';
            }
        },
        '*/cartridge/config/ConfigMgr': {
            getConstants: function () {
                return {
                    ATTRIBUTE_COLOR: 'color'
                };
            }
        },
        'dw/util/HashMap': HashMap
    });

    it('should create a property on the passed in object called variationAttributes when there is selected color', function () {
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
        variationAttributes(object, apiProductMock, variationModelMock, variablesMock);

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
        variationAttributes(object, apiProductMock, variationModelMock, variablesMock1);

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

    it('should not return any variants when all variants are out of stock and searchableIfUnavailable is false', function () {
        var object = {};
        variationAttributes(object, apiProductMock, variationModelMock2, variablesMock);

        assert.equal(object.variationAttributes[0].values.length, 0);
    });

    it('should return only one variants when one of variant are out of stock and searchableIfUnavailable is false out of two variants', function () {
        var object = {};
        variationAttributes(object, apiProductMock, variationModelMock3, variablesMock);

        assert.equal(object.variationAttributes[0].values.length, 1);
    });
});
