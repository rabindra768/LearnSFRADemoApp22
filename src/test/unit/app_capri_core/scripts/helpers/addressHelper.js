'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var ArrayList = require('../../../../mocks/dw.util.Collection');
require('app-module-path').addPath(process.cwd() + '/cartridges');

var countryCode = 'US';
var Resource = {
    msg: sinon.stub()
};
var Locale = {
    getLocale: function () {
        return {
            getCountry: function () {
                return countryCode;
            }
        };
    },
    getCountry: sinon.stub()
};
var UUIDUtils = {
    createUUID: sinon.stub()
};
var URLUtils = {
    url: function () {
        return {
            toString: function () {
                return 'someURL';
            }
        };
    }
};
var object = {
    country: {
        value: countryCode
    }
};
var server = {
    forms: {
        getForm: function () {
            return {
                clear: function () {
                    return (object);
                }
            };
        }
    }
};
var addressConfig = require('app_capri_core/cartridge/config/customAddressConfig');
var renderTemplateHelper = {
    getRenderedHtml: sinon.stub()
};
var formErrors = require('app_storefront_base/cartridge/scripts/formErrors');

var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseAddressHelpers = proxyquire('app_storefront_base/cartridge/scripts/helpers/addressHelpers', {
    'dw/system/Transaction': {
        wrap: function (arg) { arg(); }
    },
    '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
        'dw/util/ArrayList': ArrayList
    })
});
mockSuperModule.create(baseAddressHelpers);

var addressHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/addressHelpers', {
    'dw/web/Resource': Resource,
    'dw/util/Locale': Locale,
    'dw/util/UUIDUtils': UUIDUtils,
    'server': server,
    'dw/system/Transaction': {
        wrap: function (arg) { arg(); }
    },
    '*/cartridge/config/customAddressConfig': addressConfig,
    '*/cartridge/scripts/renderTemplateHelper': renderTemplateHelper,
    'dw/web/URLUtils': URLUtils,
    '*/cartridge/scripts/formErrors': formErrors
});

describe('addressHelpers-generateAddressId', function () {
    it('should create and return UUID for an address', function () {
        UUIDUtils.createUUID.returns('someUUID');
        var result = addressHelpers.generateAddressId();
        assert.equal(result, 'someUUID');
    });
});
describe('addressHelpers-addCountrySpecificFormAttributes', function () {
    it('should return an addressFormObj', function () {
        var addressForm = {
            country: {
                value: countryCode
            },
            states: {
                stateCode: {
                    statelabel: null,
                    options: { filter: function () { return true; } }
                }
            },
            postalCode: {
                ziplabel: null
            }
        };
        var addressFormObjMock = {
            country: {
                value: countryCode
            },
            states: {
                stateCode: {
                    mandatory: true,
                    hidden: false,
                    statelabel: 'state',
                    options: true,
                    maxLength: '100',
                    regEx: "^[\\da-zA-Z\\s«»\\^\\[?;:¨!§$£€%µ/\\)\\(\\}\\{\\]|\\+`\\*=~&#_@°²,.'-]*$"
                }
            },
            postalCode: {
                mandatory: true,
                ziplabel: 'zip',
                type: 'tel',
                regEx: '^\\d{5}(?:-\\d{4})?$',
                maxLength: '10'
            }
        };
        var result = addressHelpers.addCountrySpecificFormAttributes(addressForm);
        assert.deepEqual(result, addressFormObjMock);
    });
});

describe('addressHelpers-getAddressesByCurrentCountry', function () {
    it('should return an address array with address of the specific country', function () {
        var addresses = [{
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'US'
            }
        }, {
            firstName: 'Foo2',
            lastName: 'Bar2',
            address1: '102 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'US'
            }
        }, {
            firstName: 'Foo3',
            lastName: 'Bar3',
            address1: '103 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'CA'
            }
        }];
        var result = addressHelpers.getAddressesByCurrentCountry(addresses);
        assert.deepEqual(result, addresses.slice(0, 2));
    });
});

describe('addressHelpers-getNextDefaultAddress', function () {
    it('should return next default address when an address is deleted', function () {
        var addresses = [{
            firstName: 'Foo',
            lastName: 'Bar',
            address1: '10 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'US'
            },
            creationDate: 1
        }, {
            firstName: 'Foo2',
            lastName: 'Bar2',
            address1: '102 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'US'
            },
            creationDate: 2
        }, {
            firstName: 'Foo3',
            lastName: 'Bar3',
            address1: '103 Test St.',
            city: 'Testville',
            postalCode: '12345',
            phone: '123456789',
            countryCode: {
                value: 'CA'
            },
            creationDate: 3
        }];
        var result = addressHelpers.getNextDefaultAddress(addresses);
        assert.deepEqual(result, addresses[0]);
    });
});

describe('addressHelpers-getAddressBookSummaryResponseHtml', function () {
    it('should return the HTML template', function () {
        var addressBookModelMock = {
            addresses: [{
                firstName: 'Foo2',
                lastName: 'Bar2',
                address1: '102 Test St.',
                city: 'Testville',
                postalCode: '12345',
                phone: '123456789',
                countryCode: {
                    value: 'US'
                }
            }, {
                firstName: 'Foo3',
                lastName: 'Bar3',
                address1: '103 Test St.',
                city: 'Testville',
                postalCode: '12345',
                phone: '123456789',
                countryCode: {
                    value: 'CA'
                }
            }],
            preferredAddress: {
                address: [{
                    firstName: 'Foo',
                    lastName: 'Bar',
                    address1: '10 Test St.',
                    city: 'Testville',
                    postalCode: '12345',
                    phone: '123456789',
                    countryCode: {
                        value: 'US'
                    }
                }]
            }
        };
        renderTemplateHelper.getRenderedHtml.returns('someTemplate');
        var result = addressHelpers.getAddressBookSummaryResponseHtml(addressBookModelMock);
        assert.equal(result, 'someTemplate');
    });
});

