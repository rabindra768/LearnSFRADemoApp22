'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var defaultPrice = sinon.spy();

describe('Range Price Model', function () {
    var RangePrice = proxyquire('app_capri_core/cartridge/models/price/range', {
        '*/cartridge/models/price/default': defaultPrice
    });
    var minPrice = '$5';
    var maxPrice = '$15';
    var listMin = '$10';
    var listMax = '$20';

    it('should set type property value to "range"', function () {
        var rangePrice = new RangePrice(minPrice, maxPrice, listMin, listMax);
        assert.equal(rangePrice.type, 'range');
    });

    it('should set min property to a DefaultPrice instance', function () {
        new RangePrice(minPrice, maxPrice, listMin, listMax);
        assert.isTrue(defaultPrice.calledWithNew());
        assert.isTrue(defaultPrice.calledWith(minPrice, listMin));
        defaultPrice.reset();
    });

    it('should set max property to a DefaultPrice instance', function () {
        new RangePrice(minPrice, maxPrice, listMin, listMax);
        assert.isTrue(defaultPrice.calledWithNew());
        assert.isTrue(defaultPrice.calledWith(maxPrice, listMax));
        defaultPrice.reset();
    });
});
