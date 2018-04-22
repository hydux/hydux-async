"use strict";
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var index_1 = require("../index");
var Hydux = require("hydux");
var assert = require("assert");
var sleep = function (ns) { return new Promise(function (res) { return setTimeout(res, ns); }); };
var asyncApi = {
    fetchCount: function (count, failed) {
        if (failed === void 0) { failed = false; }
        return new Promise(function (resolve, reject) {
            return setTimeout(function () {
                failed
                    ? reject(new Error("Fetch " + count + " failed!"))
                    : resolve(count);
            }, 10);
        });
    },
};
describe('test', function () {
    it('return', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var loadableApi;
        return tslib_1.__generator(this, function (_a) {
            loadableApi = index_1.default({
                fetchCount: {
                    init: 0,
                    api: asyncApi.fetchCount,
                },
            });
            assert(typeof loadableApi.actions.fetchCount, 'function');
            assert(typeof loadableApi.actions.enableLoadingFlag, 'function');
            assert(typeof loadableApi.actions.disableLoadingFlag, 'function');
            return [2 /*return*/];
        });
    }); });
    it('basic function', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var loadableApi, ctx;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    loadableApi = index_1.default({
                        fetchCount: {
                            init: 0,
                            api: asyncApi.fetchCount,
                        },
                    });
                    ctx = Hydux.app({
                        init: function () { return loadableApi.state; },
                        actions: loadableApi.actions,
                        view: Hydux.noop,
                    });
                    assert.deepEqual(ctx.state, {
                        fetchCount: {
                            isLoading: false,
                            data: 0,
                            error: '',
                            rawError: null,
                        }
                    }, 'init state work');
                    ctx.actions.fetchCount(1);
                    assert.deepEqual(ctx.state, {
                        fetchCount: {
                            isLoading: true,
                            data: 0,
                            error: '',
                            rawError: null,
                        }
                    }, 'isLoading');
                    return [4 /*yield*/, sleep(11)];
                case 1:
                    _a.sent();
                    assert.deepEqual(ctx.state, {
                        fetchCount: {
                            isLoading: false,
                            data: 1,
                            error: '',
                            rawError: null,
                        }
                    }, 'handle success');
                    ctx.actions.fetchCount(2, true);
                    assert(ctx.state.fetchCount.isLoading, 'fetchFailed isLoading');
                    assert(ctx.state.fetchCount.data === 1, 'fetchFailed data');
                    return [4 /*yield*/, sleep(11)];
                case 2:
                    _a.sent();
                    assert(ctx.state.fetchCount.isLoading === false, 'fetchFailed done');
                    assert(ctx.state.fetchCount.error === "Fetch 2 failed!", 'fetchFailed done error');
                    assert(ctx.state.fetchCount.rawError.message === "Fetch 2 failed!", 'fetchFailed done rawError');
                    return [2 /*return*/];
            }
        });
    }); });
    it('handleSuccess/handleError', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var state, loadableApi, ctx, initState;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = 'none';
                    loadableApi = index_1.default({
                        fetchCount: {
                            init: 0,
                            api: asyncApi.fetchCount,
                            handleStart: function () { return (state = 'loading', void 0); },
                            handleSuccess: function () { return (state = 'succeed', void 0); },
                            handleError: function () { return (state = 'failed', void 0); },
                        },
                    });
                    ctx = Hydux.app({
                        init: function () { return loadableApi.state; },
                        actions: loadableApi.actions,
                        view: Hydux.noop,
                    });
                    initState = ctx.state;
                    ctx.actions.fetchCount(1, false);
                    assert(state === 'loading', 'succeed state isLoading');
                    return [4 /*yield*/, sleep(11)];
                case 1:
                    _a.sent();
                    assert(ctx.state.fetchCount.data === 0, 'succeed state data');
                    assert(state === 'succeed', 'succeed');
                    ctx.actions.fetchCount(2, true);
                    return [4 /*yield*/, sleep(11)];
                case 2:
                    _a.sent();
                    assert(ctx.state.fetchCount.data === 0, 'faile state data');
                    assert(ctx.state.fetchCount.error === '', 'failed state error');
                    assert(state === 'failed', 'failed');
                    return [2 /*return*/];
            }
        });
    }); });
    it('disableLoadingFlag', function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var loadableApi, ctx;
        return tslib_1.__generator(this, function (_a) {
            loadableApi = index_1.default({
                fetchCount: {
                    init: 0,
                    api: asyncApi.fetchCount,
                },
            });
            ctx = Hydux.app({
                init: function () { return loadableApi.state; },
                actions: loadableApi.actions,
                view: Hydux.noop,
            });
            ctx.actions.disableLoadingFlag();
            ctx.actions.fetchCount(1, false);
            assert.equal(ctx.state.fetchCount.isLoading, false, 'disableLoadingFlag');
            ctx.actions.enableLoadingFlag();
            ctx.actions.fetchCount(1, false);
            assert.equal(ctx.state.fetchCount.isLoading, true, 'enableLoadingFlag');
            return [2 /*return*/];
        });
    }); });
});
//# sourceMappingURL=index.test.js.map