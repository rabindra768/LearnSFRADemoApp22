'use strict';
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var assert = require('chai').assert;
require('app-module-path').addPath(process.cwd() + '/cartridges');

var AddressModel = require('../../../mocks/models/address');
var AddressBook = proxyquire('app_capri_core/cartridge/models/addressBook', {
    '*/cartridge/models/address': AddressModel
});

var currentCustomer = {
    addressBook: {
        addresses: [{
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
            stateCode: 'MA',
            UUID: 'someID'
        }],
        preferredAddress: {
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
            stateCode: 'MA',
            UUID: 'someID'
        }
    },
    customer: {},
    profile: {
        firstName: 'John',
        lastName: 'Snow',
        email: 'jsnow@starks.com'
    },
    wallet: {
        paymentInstruments: [
        ]
    },
    raw: {
        authenticated: true,
        registered: true
    }
};

var currentCustomer1 = {
    addressBook: {
        addresses: [{
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
            stateCode: 'MA',
            UUID: 'someID'
        }]
    },
    customer: {},
    profile: {
        firstName: 'John',
        lastName: 'Snow',
        email: 'jsnow@starks.com'
    },
    wallet: {
        paymentInstruments: [
        ]
    },
    raw: {
        authenticated: true,
        registered: true
    }
};

var currentCustomer2 = {
    addressBook: {
        addresses: [{
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
            stateCode: 'MA',
            UUID: 'someID'
        },
        {
            address1: '3 NYC street',
            address2: null,
            city: 'New York',
            countryCode: {
                displayValue: 'United States',
                value: 'US'
            },
            firstName: 'John',
            lastName: 'Snow',
            ID: 'Work',
            postalCode: '32501',
            stateCode: 'NY',
            UUID: 'someID'
        }],
        preferredAddress: {
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
            stateCode: 'MA',
            UUID: 'someID'
        }
    },
    customer: {},
    profile: {
        firstName: 'John',
        lastName: 'Snow',
        email: 'jsnow@starks.com'
    },
    wallet: {
        paymentInstruments: [
        ]
    },
    raw: {
        authenticated: true,
        registered: true
    }
};

describe('addressBook model in app_capri_core', function () {
    var result;
    it("should return address from currentCustomer's address book", function () {
        result = new AddressBook(currentCustomer1);
        assert.equal(result.addresses[0].ID, currentCustomer1.addressBook.addresses[0].ID);
    });

    it("should add the  address only if customer's address and preferred address are not same", function () {
        result = new AddressBook(currentCustomer2);
        assert.equal(result.addresses[0].ID, currentCustomer2.addressBook.addresses[1].ID);
        assert.notEqual(result.addresses[0].ID, currentCustomer.addressBook.preferredAddress.ID);
    });

    it('should return preferredAddress as null when customer has no preferred address', function () {
        result = new AddressBook(currentCustomer1);
        assert.isNull(result.preferredAddress);
    });

    it('should return preferredAddress when currentCustomer has preferred address', function () {
        result = new AddressBook(currentCustomer);
        assert.equal(result.preferredAddress.address.ID, currentCustomer.addressBook.preferredAddress.ID);
    });
});
