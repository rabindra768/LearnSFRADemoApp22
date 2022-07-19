'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var sinon = require('sinon');
var Site = {
    getCurrent: sinon.stub(),
    current: {
        getCustomPreferenceValue: function (a) {
            if (a === 'customerServiceEmail') {
                return 'mockCustomerServiceEmail@email.com';
            }
            return 'no-reply@testorganization.com';
        }
    }
};
var Resource = {
    msg: sinon.stub()
};
var CONSTANTS = {
    BIRTHDAYYEAR: sinon.stub()
};
var emailHelpers = {
    sendEmail: sinon.stub(),
    emailTypes: {
        registration: 1
    }
};
var crmProxy = {
    searchCustomer: function () {
        var mockObject = {
            value: 'someValue',
            status: 'NOT OK'
        };
        return mockObject;
    },
    createCustomer: sinon.stub()
};
var LoyaltyProxy = {
    enrollLoyalty: function () {
        var mockObject = {
            status: 'active'
        };
        return mockObject;
    },
    getLoyaltyAndSetProfileAttributes: sinon.stub()
};
require('app-module-path').addPath(process.cwd() + '/cartridges');

var urlStub = sinon.stub();
var mockedAuthStatus = 'AUTH_OK';
var authErrorMsg = 'NOT_EMPTY_STRING';
var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseAccoutHelpers = proxyquire('app_storefront_base/cartridge/scripts/helpers/accountHelpers', {
    'dw/web/URLUtils': {
        url: urlStub
    },
    '*/cartridge/config/oAuthRenentryRedirectEndpoints': {
        1: 'Account-Show',
        2: 'Checkout-Begin'
    },
    'dw/system/Transaction': {
        wrap: function (callback) {
            return callback();
        }
    },
    'dw/customer/CustomerMgr': {
        authenticateCustomer: function () {
            return { status: mockedAuthStatus, customer: { }, loginCustomer: function () {} };
        },
        loginCustomer: function () {}
    },
    'dw/web/Resource': {
        msg: function () {
            return authErrorMsg;
        }
    }
});
mockSuperModule.create(baseAccoutHelpers);

var accoutHelpers = proxyquire('app_capri_core/cartridge/scripts/helpers/accountHelpers', {
    'dw/web/URLUtils': {
        https: function () {
            return 'httpsurl';
        },
        url: function () {
            return 'url_1';
        }
    },
    'dw/system/Site': Site,
    'dw/web/Resource': Resource,
    '*/cartridge/config/constants': CONSTANTS,
    '*/cartridge/scripts/helpers/emailHelpers': emailHelpers,
    '*/cartridge/scripts/proxies/crmProxy': crmProxy,
    '*/cartridge/scripts/proxies/LoyaltyProxy': LoyaltyProxy
});

describe('accountHelpers-getAccountNavigationLinks', function () {
    it('should return array of Json key value pair ', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'isLoyaltyEnabled') {
                    return true;
                }
                return false;
            }
        });
        var linkList = ['myaccount', 'contactus'];
        var result = accoutHelpers.getAccountNavigationLinks(linkList);
        assert.equal(result[0].key, 'myaccount');
        assert.equal(result[0].value, 'httpsurl');
        assert.equal(result[1].key, 'contactus');
        assert.equal(result[1].value, 'url_1');
    });
    it('should return Json of key value pair when loyalty is enabled and present in argument array', function () {
        var linkList = ['myaccount', 'contactus', 'loyalty'];
        var result = accoutHelpers.getAccountNavigationLinks(linkList);
        assert.equal(result[0].key, 'myaccount');
        assert.equal(result[0].value, 'httpsurl');
        assert.equal(result[1].key, 'contactus');
        assert.equal(result[1].value, 'url_1');
        assert.equal(result[2].key, 'loyalty');
        assert.equal(result[2].value, 'httpsurl');
    });
    it('should return Json of key value pair when loyalty is disabled and present in argument array', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'isLoyaltyEnabled') {
                    return false;
                }
                return false;
            }
        });
        var linkList = ['myaccount', 'contactus', 'loyalty'];
        var result = accoutHelpers.getAccountNavigationLinks(linkList);
        assert.equal(result[0].key, 'myaccount');
        assert.equal(result[0].value, 'httpsurl');
        assert.equal(result[1].key, 'contactus');
        assert.equal(result[1].value, 'url_1');
        assert.equal(result.length, 2);
    });
});

describe('accountHelpers-getAccountTilesTemplates', function () {
    it('should return array of tile templates', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'isLoyaltyEnabled') {
                    return true;
                }
                if (a === 'enableWishlist') {
                    return true;
                }
                return false;
            }
        });
        var accountNavigationOrder = ['myaccount', 'loyalty', 'myorders', 'addresses', 'payments', 'favorites'];
        var accountTiles = {
            myaccount: 'account/components/accountTile',
            addresses: 'account/components/addressTile',
            payments: 'account/components/paymentTile',
            myorders: 'account/components/orderHistoryTile',
            loyalty: 'account/components/loyaltyTile',
            favorites: 'account/components/wishlistTile'
        };
        var result = accoutHelpers.getAccountTilesTemplates(accountNavigationOrder);
        assert.equal(result[0], accountTiles.myaccount);
        assert.equal(result[1], accountTiles.loyalty);
        assert.equal(result[2], accountTiles.myorders);
        assert.equal(result[3], accountTiles.addresses);
        assert.equal(result[4], accountTiles.payments);
        assert.equal(result[5], accountTiles.favorites);
    });
});

describe('accountHelpers-birthdateValidation', function () {
    it('should return true when validation is successful', function () {
        var month = 3;
        var date = 16;
        var result = accoutHelpers.birthdateValidation(month, date);
        assert.isTrue(result);
    });
    it('should return false when date or month is 0', function () {
        var month = 5;
        var date = 0;
        var result = accoutHelpers.birthdateValidation(month, date);
        assert.isFalse(result);
    });
    it('should return false when date > 31 or month is 1,3,5,7,8,10,12', function () {
        var month = 7;
        var date = 32;
        var result = accoutHelpers.birthdateValidation(month, date);
        assert.isFalse(result);
    });
    it('should return false when date > 30 or month is 4,6,9,11', function () {
        var month = 11;
        var date = 31;
        var result = accoutHelpers.birthdateValidation(month, date);
        assert.isFalse(result);
    });
    it('should return false when date > 29 or month is 2', function () {
        var month = 2;
        var date = 30;
        var result = accoutHelpers.birthdateValidation(month, date);
        assert.isFalse(result);
    });
});

describe('accountHelpers-validateFields', function () {
    it('should set false to certain attributes of viewData when called', function () {
        var viewData = {
            validForm: true,
            form: {
                valid: true,
                customer: {
                    month: {
                        valid: true,
                        error: null
                    }
                }
            }
        };
        Resource.msg.returns('Some information entered is invalid/missing. Please try again.');
        accoutHelpers.validateFields(viewData);
        assert.isFalse(viewData.form.customer.month.valid);
        assert.equal(viewData.form.customer.month.error, 'Some information entered is invalid/missing. Please try again.');
        assert.isFalse(viewData.form.valid);
        assert.isFalse(viewData.validForm);
    });
});

describe('accountHelpers-setBirthday', function () {
    it('should set birthday to the customer profile', function () {
        CONSTANTS.BIRTHDAYYEAR.returns('1904');
        var customerProfileMock = {
            birthday: null
        };
        var customerFormMock = {
            customer: {
                month: {
                    value: 5
                },
                date: {
                    value: 11
                }
            }
        };
        var dateMock = new Date(CONSTANTS.BIRTHDAYYEAR + '/' + customerFormMock.customer.month.value + '/' + customerFormMock.customer.date.value);
        accoutHelpers.setBirthday(customerProfileMock, customerFormMock);
        assert.deepEqual(customerProfileMock.birthday, dateMock);
    });
});

describe('accountHelpers-getBirthday', function () {
    it('should return a date string', function () {
        CONSTANTS.BIRTHDAYYEAR.returns('1904');
        var customerFormMock = {
            customer: {
                month: {
                    value: 5
                },
                date: {
                    value: 21
                }
            }
        };
        var customerProfileMock = {
            birthday: new Date(CONSTANTS.BIRTHDAYYEAR + '/' + customerFormMock.customer.month.value + '/' + customerFormMock.customer.date.value)
        };
        var currentLocaleMock = 'en_US';
        var result = accoutHelpers.getBirthday(customerProfileMock, currentLocaleMock);
        assert.equal(result, 'May 21');
    });
});

describe('accountHelpers-sendCreateAccountEmail', function () {
    it('should call emailHelpers.sendEmail function', function () {
        var registeredUserMock = {
            email: 'someEmail@email.com',
            firstName: 'someFirstName',
            lastName: 'someLastName',
            customerNo: '12345',
            url: 'someURL'
        };
        Resource.msg.returns('Subject Message');
        accoutHelpers.sendCreateAccountEmail(registeredUserMock);
        assert.isTrue(emailHelpers.sendEmail.called);
    });
});

describe('accountHelpers-crmAndLoyaltyEvents', function () {
    it('should return true when customer exists', function () {
        var customer = {
            profile: {
                email: 'someEmail@email.com',
                customerNo: '12345',
                custom: {}
            }
        };
        var result = accoutHelpers.crmAndLoyaltyEvents(customer);
        assert.isTrue(result);
    });
    it('should return false when customer does not exists', function () {
        var customer = {};
        var result = accoutHelpers.crmAndLoyaltyEvents(customer);
        assert.isFalse(result);
    });
});
