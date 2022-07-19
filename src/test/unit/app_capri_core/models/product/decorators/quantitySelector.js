'use strict';

var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();

describe('quantity selector decorator', function () {
    var quantities = proxyquire('app_capri_core/cartridge/models/product/decorators/quantitySelector', {
        'dw/web/URLUtils': {
            url: function () {
                return {
                    relative: function () {
                        return {
                            toString: function () {
                                return 'string';
                            }
                        };
                    }
                };
            }
        },
        '*/cartridge/scripts/helpers/urlHelpers': {
            appendQueryParams: function () {
                return 'some URL';
            }
        }
    });

    it('should create a property on the passed in object called quantities', function () {
        var object = {
            minOrderQuantity: 1,
            maxOrderQuantity: 10,
            selectedQuantity: 2,
            id: 'someID'
        };
        quantities(object, 1, {}, []);
        assert.equal(object.quantities.length, 10);
    });

    it('should handle selected quantity being null', function () {
        var object = {
            minOrderQuantity: 1,
            maxOrderQuantity: 10,
            selectedQuantity: null,
            id: 'someID'
        };

        quantities(object, 1, {}, []);
        assert.equal(object.quantities.length, 10);
    });

    it('should handle null attributes', function () {
        var object = {
            minOrderQuantity: 1,
            maxOrderQuantity: 10,
            selectedQuantity: null,
            id: 'someID'
        };

        quantities(object, 1, null, null);
        assert.equal(object.quantities.length, 10);
    });

    it('should handle selected quantity being more than maximum order quantity', function () {
        var object = {
            minOrderQuantity: 1,
            maxOrderQuantity: 9,
            selectedQuantity: 10,
            id: 'someID'
        };
        quantities(object, 1, {}, []);
        assert.equal(object.quantities.length, 10);
        assert.equal(object.quantities[9].value, 10);
        assert.isTrue(object.quantities[9].selected);
        assert.equal(object.quantities[9].url, 'some URL');
    });
});
