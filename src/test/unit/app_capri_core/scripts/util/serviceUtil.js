'use strict';

var assert = require('chai').assert;
var expect = require('chai').expect;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
var reachCatch = false;

var site = {
    getCurrent: function () {
        return {
            getID: function () {
                return 'mk_us';
            }
        };
    }
};

var LOGGER = {
    debug: function () {
        reachCatch = true;
    }
};

var serviceUtil = proxyquire('../../../../../cartridges/app_capri_core/cartridge/scripts/util/serviceUtil', {
    'dw/system/Site': site,
    'dw/system/Logger': LOGGER
});

var credential = false;

var svc = {
    setCredentialID: function () {
        credential = true;
    }
};


describe('serviceUtil', function () {
    describe('getPossibleIDs', function () {
        it('should return an array', function () {
            expect(serviceUtil.getPossibleIDs('testService')).to.be.an('array');
        });

        it('should check whether testService.mk_us is present in the returned array of services', function () {
            assert.include(serviceUtil.getPossibleIDs('testService'), 'testService.mk_us', 'array contains value');
        });
    });

    describe('setCredentialID', function () {
        it('Error while fetching the credential- ID', function () {
            serviceUtil.setCredentialID(null);
            assert.isTrue(reachCatch);
        });

        it('should execute setCredentialID successfully', function () {
            serviceUtil.setCredentialID(svc, 'mk_us');
            assert.isTrue(credential);
        });
    });
});
