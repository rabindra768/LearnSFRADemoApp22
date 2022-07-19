/* eslint-disable keyword-spacing */
'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');
var sinon = require('sinon');
var ArrayList = require('../../../../mocks/dw.util.Collection.js');
var mockOptions = [{
    optionId: 'option 1',
    selectedValueId: '123'
}];

var availabilityModelMock = {
    inventoryRecord: {
        ATS: {
            value: 1
        }
    }
};

var productLineItemMock = {
    productID: 'someProductID',
    quantity: {
        value: 1
    },
    setQuantityValue: function () {
        return;
    },
    quantityValue: 1,
    product: {
        availabilityModel: availabilityModelMock
    },
    optionProductLineItems: new ArrayList(mockOptions),
    bundledProductLineItems: new ArrayList([])
};

var stubGetBonusLineItems = function () {
    var bonusProducts = [{
        ID: 'pid_1'
    },
    {
        ID: 'pid_2'
    }];
    var index2 = 0;
    var bonusDiscountLineItems = [
        {
            name: 'name1',
            ID: 'ID1',
            description: 'description 1',
            UUID: 'uuid_string',
            maxBonusItems: 1,
            bonusProducts: {
                iterator: function () {
                    return {
                        items: bonusProducts,
                        hasNext: function () {
                            return index2 < bonusProducts.length;
                        },
                        next: function () {
                            return bonusProducts[index2++];
                        }
                    };
                }
            }
        }
    ];
    var index = 0;

    return {
        id: 2,
        name: '',
        iterator: function () {
            return {
                items: bonusDiscountLineItems,
                hasNext: function () {
                    return index < bonusDiscountLineItems.length;
                },
                next: function () {
                    return bonusDiscountLineItems[index++];
                }
            };
        }
    };
};
var createApiBasket = function (productInBasket) {
    var currentBasket = {
        defaultShipment: {},
        getShipments: function () {
            return {};
        },

        createShipment: function () {
            return {
                custom: {
                    fromStoreId: '',
                    shipmentType: ''
                }
            };
        },
        createProductLineItem: function () {
            return {
                setQuantityValue: function () {
                    return;
                }
            };
        },
        getBonusDiscountLineItems: stubGetBonusLineItems
    };
    if (productInBasket) {
        currentBasket.productLineItems = new ArrayList([productLineItemMock]);
        currentBasket.allLineItems = {};
        currentBasket.allLineItems.length = 1;
    } else {
        currentBasket.productLineItems = new ArrayList([]);
    }

    return currentBasket;
};
var mockSuperModule = require('../../../../mocks/modules/mockModuleSuperModule');
var baseHelper = proxyquire('app_storefront_base/cartridge/scripts/cart/cartHelpers', {
    '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
        'dw/util/ArrayList': ArrayList
    }),
    '*/cartridge/scripts/checkout/shippingHelpers': {},
    '*/cartridge/scripts/helpers/productHelpers': {},
    '*/cartridge/scripts/util/array': {},
    'dw/web/Resource': {
        msg: function () {
            return 'someString';
        },
        msgf: function () {
            return 'someString';
        }
    },
    'dw/web/URLUtils': {
        url: function () {
            return {
                toString: function () {
                    return 'string URL';
                }
            };
        }
    }

});
mockSuperModule.create(baseHelper);

var Site = {
    getCurrent: sinon.stub()
};
var getStoredBasketsinon = sinon.stub();
var getCurrentOrNewBasketspy = sinon.stub();
var addPLICustomAttributesspy = sinon.spy();
var mergeCouponLineItemsspy = sinon.spy();
describe('cartHelpers capri_core', function () {
    var findStub = sinon.stub();
    findStub.withArgs([productLineItemMock]).returns(productLineItemMock);

    var cartHelpers = proxyquire('app_capri_core/cartridge/scripts/cart/cartHelpers', {
        'dw/catalog/ProductMgr': {
            getProduct: function () {
                return {
                    optionModel: {
                        getOption: function () {},
                        getOptionValue: function () {},
                        setSelectedOptionValue: function () {}
                    },
                    availabilityModel: availabilityModelMock
                };
            }
        },
        '*/cartridge/scripts/util/collections': proxyquire('app_storefront_base/cartridge/scripts/util/collections', {
            'dw/util/ArrayList': ArrayList
        }),
        '*/cartridge/scripts/checkout/shippingHelpers': {
            ensureShipmentHasMethod: function () {
                return {};
            }
        },
        'dw/system/Transaction': {
            wrap: function (item) {
                item();
            }
        },
        '*/cartridge/scripts/util/array': { find: findStub },
        'dw/web/Resource': {
            msg: function () {
                return 'someString';
            },
            msgf: function () {
                return 'someString';
            }
        },
        '*/cartridge/scripts/helpers/productHelpers': {
            getOptions: function () {},
            getCurrentOptionModel: function () {},
            getMaxOrderQuantity: function () {
                return 5;
            }
        },
        'dw/web/URLUtils': {
            url: function () {
                return {
                    toString: function () {
                        return 'string URL';
                    }
                };
            }
        },
        '*/cartridge/config/ConfigMgr': {
            getPreferences: function () {
                return{ miniBagFlyOutTimeinMilliSec: 500 };
            }
        },
        'dw/system/Site': Site,
        'dw/order/BasketMgr': {
            getCurrentOrNewBasket: getCurrentOrNewBasketspy,
            getStoredBasket: getStoredBasketsinon
        },
        '*/cartridge/scripts/helpers/mergeCartHelper': {
            getProductLineItemsInSB: function () {
                var products = new ArrayList([{ pid: '123', qty: 10 }, { pid: '1233', qty: 100 }]);
                return products.toArray();
            },
            addPLICustomAttributes: addPLICustomAttributesspy,
            mergeCouponLineItems: mergeCouponLineItemsspy
        },
        '*/cartridge/scripts/proxies/ProductPersonalisationProxy': {
            isPersonalisationEnabledForProduct: function () {
            }
        }
    });

    it('should add a product to the cart ', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'singleQuantityLineItemsOnly') {
                    return false;
                }else if(a === 'toastMessageDisplayTime') {
                    return 900;
                }
                return true;
            }

        });
        var currentBasket = createApiBasket(false);
        var spy = sinon.spy(currentBasket, 'createProductLineItem');
        spy.withArgs(1);
        cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true, true);
        assert.isTrue(spy.calledOnce);
        currentBasket.createProductLineItem.restore();
    });

    it('should not add a product to the cart  when quantity is more than getmaxOrderquantity', function () {
        var currentBasket = createApiBasket(true);

        var result = cartHelpers.addProductToCart(currentBasket, 'someProductID', 6, [], mockOptions, '', null, true);
        assert.isTrue(result.error);
        assert.equal(result.message, 'someString');
    });

    it('should not add a product to the cart when getmaxOrderquantity is already in cart', function () {
        var currentBasket = createApiBasket(true);
        currentBasket.productLineItems.toArray()[0].quantity.value = 5;

        var result = cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true);
        assert.isTrue(result.error);
        assert.equal(result.message, 'someString');
    });
    it('should  add a product to the cart and getting toastMessageDisplatTime', function () {
        var currentBasket = createApiBasket(true);
        currentBasket.productLineItems.toArray()[0].quantity.value = 5;

        var result = cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true);
        assert.isTrue(result.error);
        assert.equal(result.toastMessageDisplayTime, 900);
    });
    it('should  add a product to the cart and getting miniBagFlyOutTimeinMilliSec', function () {
        var currentBasket = createApiBasket(true);
        currentBasket.productLineItems.toArray()[0].quantity.value = 5;

        var result = cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true);
        assert.isTrue(result.error);
        assert.equal(result.miniBagFlyOutTimeinMilliSec, 500);
    });

    it('should set the quantity of the product in the cart', function () {
        Site.getCurrent.returns({
            getCustomPreferenceValue: function (a) {
                if (a === 'singleQuantityLineItemsOnly') {
                    return true;
                }
                return false;
            }
        });
        var currentBasket = createApiBasket(true);
        var spy = sinon.spy(currentBasket.productLineItems.toArray()[0], 'setQuantityValue');
        spy.withArgs(1);

        cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true);
        assert.isFalse(spy.calledOnce);
        currentBasket.productLineItems.toArray()[0].setQuantityValue.restore();
    });

    describe('getQtyAlreadyInCart() function', function () {
        it('should add a product to the cart that is eligible for bonus products', function () {
            var currentBasket = createApiBasket(false);
            var spy = sinon.spy(currentBasket, 'createProductLineItem');
            spy.withArgs(1);

            var previousBonusDiscountLineItems = cartHelpers.addProductToCart(currentBasket, 'someProductID', 1, [], mockOptions, '', null, true);
            previousBonusDiscountLineItems.contains = function (x) {
                var expectedResult = {
                    name: 'name1',
                    ID: 'ID1',
                    description: 'description 1',
                    UUID: 'uuid_string',
                    maxBonusItems: 1
                };
                return expectedResult === x;
            };
            var urlObject = {
                url: 'Cart-ChooseBonusProducts',
                configureProductstUrl: 'Product-ShowBonusProducts',
                addToCartUrl: 'Cart-AddBonusProducts'
            };

            var newBonusDiscountLineItem =
                cartHelpers.getNewBonusDiscountLineItem(
                    currentBasket,
                    previousBonusDiscountLineItems,
                    urlObject
            );
            assert.equal(newBonusDiscountLineItem.maxBonusItems, 1);
            assert.equal(newBonusDiscountLineItem.addToCartUrl, 'Cart-AddBonusProducts');
            assert.equal(newBonusDiscountLineItem.configureProductstUrl, 'string URL');
            assert.equal(newBonusDiscountLineItem.uuid, 'uuid_string');
            assert.equal(newBonusDiscountLineItem.bonuspids.length, 2);
            assert.equal(newBonusDiscountLineItem.bonuspids[0], 'pid_1');
            assert.equal(newBonusDiscountLineItem.bonuspids[1], 'pid_2');
            assert.equal(newBonusDiscountLineItem.newBonusDiscountLineItem.name, 'name1');
            assert.equal(newBonusDiscountLineItem.newBonusDiscountLineItem.ID, 'ID1');
            assert.equal(newBonusDiscountLineItem.newBonusDiscountLineItem.maxBonusItems, 1);
            assert.equal(newBonusDiscountLineItem.newBonusDiscountLineItem.description, 'description 1');
            assert.equal(newBonusDiscountLineItem.labels.close, 'someString');
            assert.equal(newBonusDiscountLineItem.labels.selectprods, 'someString');
        });
    });
    describe('mergeBasket function', function () {
        var storedBasket = new ArrayList([{ pid: '123', qty: 10 }, { pid: '1233', qty: 100 }]);
        afterEach(function () {
            addPLICustomAttributesspy.reset();
            mergeCouponLineItemsspy.reset();
        });
        it('should call the addPLICustomAttributes and mergeCouponLineItems', function () {
            getStoredBasketsinon.returns(storedBasket);
            getCurrentOrNewBasketspy.returns(createApiBasket(true));
            cartHelpers.mergeBasket();
            assert.isTrue(addPLICustomAttributesspy.called);
            assert.isTrue(mergeCouponLineItemsspy.called);
        });
        it('should  not call the addPLICustomAttributes and mergeCouponLineItems', function () {
            getCurrentOrNewBasketspy.returns(createApiBasket(true));
            getStoredBasketsinon.returns(null);
            cartHelpers.mergeBasket();
            assert.isFalse(addPLICustomAttributesspy.called);
            assert.isFalse(mergeCouponLineItemsspy.called);
        });
        it('should not  call the addPLICustomAttributes and mergeCouponLineItems and go to catch block', function () {
            getCurrentOrNewBasketspy.returns({});
            getStoredBasketsinon.returns(storedBasket);
            var Spy = sinon.spy(require('dw/system/Logger'), 'error');
            cartHelpers.mergeBasket();
            assert.isTrue(Spy.calledOnce);
        });
    });
});
