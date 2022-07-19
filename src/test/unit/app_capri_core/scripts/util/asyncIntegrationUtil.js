'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var customObject = {
    custom: {}
};
var CustomObjectMgr = {
    createCustomObject: function () {
        return customObject;
    }
};
var constants = {
    crmTransactionCustomObject: 'CRMTransactions'
};

describe('asyncIntegrationUtil script', function () {
    var asyncIntegrationUtil = proxyquire('app_capri_core/cartridge/scripts/util/asyncIntegrationUtil', {
        'dw/object/CustomObjectMgr': CustomObjectMgr,
        '*/cartridge/config/constants': constants
    });
    var response;

    it('checking response when creation of custom object is successful', function () {
        var profile1 = {
            email: 'email',
            customerNo: '1',
            firstName: 'abc',
            lastName: 'xyz'
        };
        response = asyncIntegrationUtil.createCrmTransaction(profile1, 'createCustomer');
        assert.isTrue(response);
        assert.equal(customObject.custom.type, 'createCustomer');
        assert.equal(customObject.custom.address, '');
    });

    it('checking response for marketingAddress type with valid input', function () {
        var profile2 = {
            address: {
                address1: '15 South Point Drive',
                address2: null,
                city: 'Boston',
                countryCode: {
                    displayValue: 'United States',
                    value: 'US'
                },
                firstName: 'John',
                lastName: 'Snow',
                ID: 'Home',
                postalCode: '02125',
                stateCode: 'MA'
            }
        };
        response = asyncIntegrationUtil.createCrmTransaction(profile2, 'marketingAddress');
        assert.equal(customObject.custom.type, 'marketingAddress');
        assert.isTrue(response);
        assert.equal(customObject.custom.address.address1, '15 South Point Drive');
        assert.equal(customObject.custom.sfccProfileId, '');
    });

    it('should return false when creation of custom object is unsuccessful', function () {
        var asyncIntegrationUtil1 = proxyquire('app_capri_core/cartridge/scripts/util/asyncIntegrationUtil', {
            'dw/object/CustomObjectMgr': CustomObjectMgr,
            '*/cartridge/config/constants': constants,
            'dw/customer/Customer': {}
        });
        response = asyncIntegrationUtil1.createCrmTransaction('', 'createCustomer');
        assert.isFalse(response);
    });
});
