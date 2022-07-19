'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var productMock = {
    maxOrderQuantity: {
        value: null
    }
};
var Site = {
    getCurrent: sinon.stub()

};
describe('product quantity decorator app_capri_core', function () {
    var quantity = proxyquire('../../../../../../cartridges/app_capri_core/cartridge/models/product/decorators/quantity', {
        'dw/system/Site': Site,
        '*/cartridge/scripts/helpers/productHelpers': {
            getMaxOrderQuantity: function () {
                return 5;
            }

        }
    });
    it('should set the value of maxorderQuantity when quantitySelector is Enabled', function () {
        var object = {};
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'quantitySelectorEnabled') {
                    return true;
                }
                return true;
            }
        });

        quantity(object, productMock, 1);
        assert.equal(object.maxOrderQuantity, 5);
    });

    it('should set the value of maxorderQuantity when quantitySelector is not Enabled', function () {
        var object = {};
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'quantitySelectorEnabled') {
                    return false;
                }
                return true;
            }
        });

        quantity(object, productMock, 1);
        assert.equal(object.maxOrderQuantity, 1);
    });
});
