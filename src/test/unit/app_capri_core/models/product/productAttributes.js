'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var ArrayList = require('../../../../mocks/dw.util.Collection');
var toProductMock = require('../../../../util');
var HashMap = require('dw-api-mock/dw/util/HashMap');
require('app-module-path').addPath(process.cwd() + '/cartridges');
describe('productAttributes', function () {
    var ProductAttributes = proxyquire('app_capri_core/cartridge/models/product/productAttributes', {
        '*/cartridge/models/product/productImages': function () { },
        '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
            'dw/util/ArrayList': ArrayList

        }),
        'dw/util/HashMap': HashMap,
        '*/cartridge/scripts/helpers/urlHelpers': {
            appendQueryParams: function () {
                return 'some url';
            }
        }
    });

    var variationsMock = {
        productVariationAttributes: new ArrayList([]),
        getSelectedValue: {
            return: {
                equals: {
                    return: true,
                    type: 'function'
                }
            },
            type: 'function'
        },
        getAllValues: {
            return: new ArrayList([]),
            type: 'function'
        },
        getFilteredValues: {
            return: new ArrayList([]),
            type: 'function'
        },
        hasOrderableVariants: {
            return: false,
            type: 'function'
        },
        urlUnselectVariationValue: {
            return: 'unselect_url',
            type: 'function'
        },
        urlSelectVariationValue: {
            return: 'select_url',
            type: 'function'
        }

    };
    it('should return color attributes with multiple values', function () {
        var tempMock = Object.assign({}, variationsMock);

        tempMock.productVariationAttributes = new ArrayList([{
            attributeID: 'color',
            displayName: 'color',
            ID: 'color'
        }]);

        tempMock.getFilteredValues.return = new ArrayList([{
            ID: 'someID',
            description: '',
            displayValue: 'someValue',
            value: 'value',
            selectable: true,
            selected: false,
            url: '',
            forcedOnline: false,
            inStock: true

        }]);

        var attributeConfig = {
            attributes: ['color'],
            endPoint: 'Show'
        };

        tempMock.getSelectedValue.return = false;
        tempMock.hasOrderableVariants.return = true;
        tempMock.urlSelectVariationValue.return = 'some url';

        var mock = toProductMock(tempMock);

        var attrs = new ProductAttributes(mock, attributeConfig);

        assert.equal(attrs.length, 1);
        assert.equal(attrs[0].id, 'color');
        assert.equal(attrs[0].values.length, 1);
        assert.equal(attrs[0].values[0].displayValue, 'someValue');
    });
});
