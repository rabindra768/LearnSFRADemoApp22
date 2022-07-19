'use strict';

var assert = require('chai').assert;
var proxyquire = require('proxyquire').noCallThru().noPreserveCache();
require('app-module-path').addPath(process.cwd() + '/cartridges');

var sinon = require('sinon');
var mockCollections = require('../../../../mocks/util/collections');
var ArrayList = require('../../../../mocks/dw.util.Collection');

describe('price factory in app_capri_core', function () {
    var price;
    var mockProduct;

    var spyDefaultPrice = sinon.spy();
    var spyTieredPrice = sinon.spy();
    var stubRangePrice = sinon.stub();
    var stubGetPromotionPrice = sinon.stub();
    var stubGetProductPromotions = sinon.stub();
    stubGetProductPromotions.returns([]);

    var PROMOTION_CLASS_PRODUCT = 'awesome promotion';

    var priceHelper = {
        getRootPriceBook: function () {
            return {
                ID: '123'
            };
        },
        getPromotionPrice: stubGetPromotionPrice
    };

    var preferences = {
        enablePriceRangeAtColor: true
    };
    var ConfigMgr = {
        getConstants: function () {
            return {
                ATTRIBUTE_COLOR: 'color'
            };
        },
        getPreferences: function () {
            return preferences;
        }
    };

    var priceFactory = proxyquire('app_capri_core/cartridge/scripts/factories/price', {
        '*/cartridge/scripts/util/collections': mockCollections,
        '*/cartridge/config/ConfigMgr': ConfigMgr,
        '*/cartridge/scripts/helpers/pricing': priceHelper,
        '*/cartridge/models/price/default': spyDefaultPrice,
        '*/cartridge/models/price/range': stubRangePrice,
        '*/cartridge/models/price/tiered': spyTieredPrice,
        'dw/value/Money': {
            NOT_AVAILABLE: null
        },
        'dw/campaign/Promotion': {
            PROMOTION_CLASS_PRODUCT: PROMOTION_CLASS_PRODUCT
        },
        'dw/campaign/PromotionMgr': {
            activeCustomerPromotions: {
                getProductPromotions: stubGetProductPromotions
            }
        }
    });

    var currency = 'USD';
    var promotionalPrice = {
        available: true,
        value: 10,
        valueOrNull: 10
    };
    var promotions = [{
        promotionClass: {
            equals: function () { return true; }
        },
        getPromotionalPrice: function () {
            return promotionalPrice;
        }
    }];

    describe('Tiered Price', function () {
        var priceTable;

        afterEach(function () {
            spyTieredPrice.reset();
        });

        it('should produce a tiered price if price tables have more than 1 quantity', function () {
            priceTable = { quantities: { length: 3 } };
            mockProduct = {
                getPriceModel: function () {
                    return {
                        getPriceTable: function () { return priceTable; }
                    };
                }
            };
            price = priceFactory.getPrice(mockProduct);
            assert.isTrue(spyTieredPrice.calledWithNew());
        });

        it('should not produce a tiered price if a price table has only 1 quantity', function () {
            priceTable = { quantities: { length: 1 } };
            mockProduct = {
                master: false,
                priceModel: {
                    priceRange: false,
                    price: {
                        valueOrNull: null
                    },
                    minPrice: '$5',
                    getPriceTable: function () {
                        return priceTable;
                    }
                },
                getPriceModel: function () {
                    return this.priceModel;
                },
                variationModel: {
                    variants: [{}, {}]
                }
            };
            price = priceFactory.getPrice(mockProduct);
            assert.isFalse(spyTieredPrice.calledWithNew());
        });
    });
    describe('Range Price', function () {
        var priceInfo = { priceInfo: {
            priceBook: {
                ID: 'mockID'
            }
        }
        };
        var priceInfo1 = { priceInfo: false };
        var rangePrice = {
            min: {
                sales: { value: '$5' }
            },
            max: {
                sales: { value: '$15' }
            }
        };

        beforeEach(function () {
            mockProduct = {
                master: true,
                priceModel: {
                    price: { valueOrNull: 'value' },
                    priceInfo: { priceBook: {} },
                    priceRange: true,
                    getPriceTable: function () {
                        return {
                            quantities: { length: 1 }
                        };
                    },
                    getPriceBookPrice: function () {
                        return { available: true };
                    },
                    getMinPriceBookPrice: function () {
                        return {
                            minPrice: '$5'
                        };
                    },
                    getMaxPriceBookPrice: function () {
                        return {
                            maxPrice: '$15'
                        };
                    },
                    minPrice: '$10',
                    maxPrice: '$50'
                },
                getPriceModel: function () {
                    return this.priceModel;
                },
                variationModel: {
                    variants: [{
                        getPriceModel: function () {
                            return priceInfo;
                        }
                    }, {}]
                }
            };
        });

        afterEach(function () {
            stubRangePrice.reset();
            spyDefaultPrice.reset();
        });

        it('should produce a range price', function () {
            stubRangePrice.returns(rangePrice);
            price = priceFactory.getPrice(mockProduct);
            assert.equal(price, rangePrice);
        });

        it("should produce a range price even variant price model's price info is not available", function () {
            rangePrice = {
                min: {
                    sales: { value: '$10' }
                },
                max: {
                    sales: { value: '$50' }
                }
            };
            stubRangePrice.returns(rangePrice);
            mockProduct.variationModel.variants[0].getPriceModel = function () {
                return priceInfo1;
            };
            price = priceFactory.getPrice(mockProduct);
            assert.equal(price, rangePrice);
        });

        var expectedPrice;
        var priceModel;
        var selectedVariantProduct;
        var mockVariationModel;

        it('should instantiate DefaultPrice when minPrice equals listMinPrice for selected color', function () {
            expectedPrice = { available: true };
            priceModel = {
                price: { valueOrNull: null,
                    equals: function () {
                        return true;
                    }
                },
                priceInfo: { priceBook: {} },
                priceRange: false,
                minPrice: '$8',
                getPriceTable: function () {
                    return {
                        quantities: { length: 1 }
                    };
                },
                getPriceBookPrice: function () { return expectedPrice; }
            };
            selectedVariantProduct = {
                getAvailabilityModel: function () {
                    return {
                        isInStock: function () {
                            return false;
                        }
                    };
                },
                getSearchableIfUnavailableFlag: function () {
                    return true;
                },
                priceModel: priceModel
            };
            mockVariationModel = {
                getProductVariationAttribute: function () {
                    return {
                        ID: 'variation ID'
                    };
                },
                getSelectedValue: function () {
                    return {
                        ID: 'selected product ID'
                    };
                },
                getVariants: function () {
                    return new ArrayList([selectedVariantProduct]);
                }
            };
            price = priceFactory.getPrice(mockProduct, currency, null, promotions, true, mockVariationModel);
            assert.isTrue(spyDefaultPrice.calledWith(priceModel.price, null));
        });


        it('should instantiate DefaultPrice when minPrice equals maxPrice & listMinPrice equals listMaxPrice', function () {
            priceModel.price.equals = function () {
                return false;
            };
            price = priceFactory.getPrice(mockProduct, currency, null, promotions, true, mockVariationModel);
            assert.isTrue(spyDefaultPrice.calledWith(priceModel.price, priceModel.minPrice));
        });

        it('should return a range price of selected color', function () {
            stubRangePrice.returns(rangePrice);
            priceModel.price.equals = function () {
                return true;
            };
            var priceModel1 = {
                price: { valueOrNull: null,
                    equals: function () {
                        return true;
                    }
                },
                priceInfo: { priceBook: {} },
                priceRange: false,
                minPrice: '$10',
                getPriceTable: function () {
                    return {
                        quantities: { length: 1 }
                    };
                },
                getPriceBookPrice: function () { return expectedPrice; }
            };
            var selectedVariantProduct2 = {
                getAvailabilityModel: function () {
                    return {
                        isInStock: function () {
                            return true;
                        }
                    };
                },
                getSearchableIfUnavailableFlag: function () {
                    return false;
                },
                priceModel: priceModel1
            };
            mockVariationModel.getVariants = function () {
                return new ArrayList([selectedVariantProduct, selectedVariantProduct2]);
            };
            price = priceFactory.getPrice(mockProduct, currency, null, promotions, true, mockVariationModel);
            assert.equal(price, rangePrice);
        });

        it('should not produce a range price if min and max values are equal', function () {
            rangePrice = {
                min: {
                    sales: { value: '$5' }
                },
                max: {
                    sales: { value: '$5' }
                }
            };
            stubRangePrice.returns(rangePrice);
            mockProduct.variationModel = { variants: [] };

            price = priceFactory.getPrice(mockProduct, currency, null, promotions, true, mockVariationModel);
            assert.notEqual(price, rangePrice);
        });
    });

    describe('Default Price', function () {
        var priceModel = {};
        var secondSpyArg;
        var variantPriceModel = {};

        afterEach(function () {
            spyDefaultPrice.reset();
        });

        it('should use the first variant if product is a main', function () {
            var expectedPrice = { available: true };
            priceModel = {
                price: { valueOrNull: 'value' },
                priceInfo: { priceBook: {} },
                priceRange: false,
                getPriceTable: function () {
                    return {
                        quantities: { length: 1 }
                    };
                },
                getPriceBookPrice: function () { return expectedPrice; }
            };
            variantPriceModel = {
                price: { valueOrNull: null },
                priceInfo: { priceBook: {} },
                priceRange: false,
                minPrice: '$8',
                getPriceTable: function () {
                    return {
                        quantities: { length: 1 }
                    };
                },
                getPriceBookPrice: function () { return expectedPrice; }
            };
            mockProduct = {
                master: true,
                priceModel: priceModel,
                getPriceModel: function () { return priceModel; },
                variationModel: {
                    variants: [{ priceModel: variantPriceModel }, {}]
                }
            };
            price = priceFactory.getPrice(mockProduct);
            assert.isTrue(spyDefaultPrice.calledWith(variantPriceModel.price));
        });

        it('should assign list price to root pricebook price when available', function () {
            var pricebookListPrice = {
                available: true,
                value: '$20',
                valueOrNull: 20
            };
            mockProduct = {
                master: false,
                priceModel: {
                    price: { valueOrNull: 'value' },
                    priceInfo: { priceBook: {} },
                    priceRange: false,
                    getPriceTable: function () {
                        return {
                            quantities: { length: 1 }
                        };
                    },
                    getPriceBookPrice: function () { return pricebookListPrice; }
                },
                getPriceModel: function () { return this.priceModel; },
                variationModel: {
                    variants: [{}, {}]
                }
            };
            price = priceFactory.getPrice(mockProduct);
            secondSpyArg = spyDefaultPrice.args[0][1];
            assert.isTrue(spyDefaultPrice.calledWithNew());
            assert.equal(secondSpyArg, pricebookListPrice);
        });

        it('should instantiate DefaultPrice with only sales price when equal to list price', function () {
            var expectedPrice = { available: false };
            mockProduct = {
                master: false,
                priceModel: {
                    price: {
                        available: true,
                        valueOrNull: 'value',
                        value: '$28'
                    },
                    priceInfo: { priceBook: {} },
                    priceRange: false,
                    minPrice: {
                        value: '$2'
                    },
                    getPriceTable: function () {
                        return {
                            quantities: { length: 1 }
                        };
                    },
                    getPriceBookPrice: function () { return expectedPrice; }
                },
                getPriceModel: function () { return this.priceModel; }
            };
            price = priceFactory.getPrice(mockProduct);
            assert.isTrue(spyDefaultPrice.calledWith(mockProduct.priceModel.price, null));
        });

        it('should assign list price to priceModel minPrice when root pricebook and priceModel price not available', function () {
            var expectedPrice = { available: false };
            mockProduct = {
                master: false,
                priceModel: {
                    price: {
                        available: false,
                        valueOrNull: 'value',
                        value: '$28'
                    },
                    priceInfo: { priceBook: {} },
                    priceRange: false,
                    minPrice: {
                        value: '$2'
                    },
                    getPriceTable: function () {
                        return {
                            quantities: { length: 1 }
                        };
                    },
                    getPriceBookPrice: function () { return expectedPrice; }
                },
                getPriceModel: function () { return this.priceModel; }
            };
            price = priceFactory.getPrice(mockProduct);
            secondSpyArg = spyDefaultPrice.args[0][1];
            assert.isTrue(spyDefaultPrice.calledWithNew());
            assert.equal(secondSpyArg, mockProduct.priceModel.minPrice);
        });

        describe('with promotional prices', function () {
            var listPrice = {
                available: true,
                value: 50,
                valueOrNull: 50
            };
            var salesPrice = {
                value: 30,
                valueOrNull: 'value',
                compareTo: function (otherPrice) {
                    return this.value > otherPrice.value;
                }
            };

            beforeEach(function () {
                stubGetProductPromotions.returns(promotions);
                stubGetPromotionPrice.returns({
                    available: true,
                    value: 10,
                    valueOrNull: 10
                });
            });

            afterEach(function () {
                spyDefaultPrice.reset();
            });

            it('should swap sales price for promo price', function () {
                mockProduct = {
                    master: false,
                    priceModel: {
                        price: salesPrice,
                        priceInfo: { priceBook: {} },
                        getPriceTable: function () {
                            return {
                                quantities: { length: 1 }
                            };
                        },
                        getPriceBookPrice: function () { return listPrice; }
                    },
                    getPriceModel: function () { return this.priceModel; }
                };
                price = priceFactory.getPrice(mockProduct, null, null, promotions);
                assert.isTrue(spyDefaultPrice.calledWithNew());
                assert.isTrue(spyDefaultPrice.calledWith(promotionalPrice, listPrice));
            });

            it('should get a promotional price when an option product is provided', function () {
                mockProduct = {
                    master: false,
                    priceModel: {
                        price: salesPrice,
                        priceInfo: { priceBook: {} },
                        getPriceTable: function () {
                            return {
                                quantities: { length: 1 }
                            };
                        },
                        getPriceBookPrice: function () { return listPrice; }
                    },
                    getPriceModel: function () { return this.priceModel; }
                };
                price = priceFactory.getPrice(mockProduct, null, null, promotions, true);
                assert.isTrue(spyDefaultPrice.calledWithNew());
                assert.isTrue(spyDefaultPrice.calledWith(promotionalPrice, listPrice));
            });

            it('should get a promotional price when an option product is not provided', function () {
                mockProduct = {
                    master: false,
                    priceModel: {
                        price: salesPrice,
                        priceInfo: { priceBook: {} },
                        getPriceTable: function () {
                            return {
                                quantities: { length: 1 }
                            };
                        },
                        getPriceBookPrice: function () { return listPrice; }
                    },
                    getPriceModel: function () { return this.priceModel; },
                    optionModel: { option: 'model' }
                };
                price = priceFactory.getPrice(mockProduct, null, null, promotions, false);
                assert.isTrue(spyDefaultPrice.calledWithNew());
                assert.isTrue(spyDefaultPrice.calledWith(promotionalPrice, listPrice));
            });

            it('should set sales price to list price if sales price is null', function () {
                mockProduct = {
                    master: false,
                    priceModel: {
                        price: {
                            value: null,
                            valueOrNull: null,
                            compareTo: function (otherPrice) {
                                return this.value > otherPrice.value;
                            }
                        },
                        priceInfo: { priceBook: {} },
                        getPriceTable: function () {
                            return {
                                quantities: { length: 1 }
                            };
                        },
                        getPriceBookPrice: function () { return listPrice; }
                    },
                    getPriceModel: function () { return this.priceModel; },
                    optionModel: { option: 'model' }
                };
                price = priceFactory.getPrice(mockProduct, null, null, promotions, false);
                assert.isTrue(spyDefaultPrice.calledWithNew());
                assert.isTrue(spyDefaultPrice.calledWith(listPrice, {}));
            });
        });
    });
});
