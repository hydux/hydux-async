"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var hydux_1 = require("hydux");
var makeKey = function (name) { return "@hydux-data/" + name; };
function Loadable(param) {
    var state = {};
    var HandlerSuccess = makeKey('handleSuccess');
    var HandlerError = makeKey('handleError');
    var HandlerStart = makeKey('handleStart');
    var LoadingFlagDisabled = makeKey('loadingFlagDisabled');
    var actions = (_a = {},
        _a[HandlerSuccess] = function (key, data) { return function (state, actions) {
            return (tslib_1.__assign({}, state, (_a = {}, _a[key] = {
                isLoading: false,
                rawError: null,
                data: data,
                error: '',
            }, _a)));
            var _a;
        }; },
        _a[HandlerError] = function (key, error) { return function (state, actions) {
            return (tslib_1.__assign({}, state, (_a = {}, _a[key] = tslib_1.__assign({}, state[key], { isLoading: false, rawError: error, error: error.message }), _a)));
            var _a;
        }; },
        _a[HandlerStart] = function (key) { return function (state, actions) {
            return (tslib_1.__assign({}, state, (_a = {}, _a[key] = tslib_1.__assign({}, state[key], { isLoading: true, rawError: null, error: '' }), _a)));
            var _a;
        }; },
        _a.enableLoadingFlag = function () { return function (state) {
            return (tslib_1.__assign({}, state, (_a = {}, _a[LoadingFlagDisabled] = false, _a)));
            var _a;
        }; },
        _a.disableLoadingFlag = function () { return function (state) {
            return (tslib_1.__assign({}, state, (_a = {}, _a[LoadingFlagDisabled] = true, _a)));
            var _a;
        }; },
        _a);
    var _loop_1 = function (key) {
        var info = param[key];
        state[key] = {
            error: '',
            data: info.init,
            isLoading: false,
            rawError: null,
        };
        actions[key] = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return function (state, actions, ps, pa) {
                var runCustomAction = function (result) { return hydux_1.runAction(result, state, actions, ps, pa); };
                return [
                    state,
                    hydux_1.Cmd.batch(state[LoadingFlagDisabled]
                        ? hydux_1.Cmd.none
                        : hydux_1.Cmd.ofSub(function () {
                            return info.handleStart
                                ? runCustomAction(info.handleStart(key))
                                : actions[HandlerStart](key);
                        }), hydux_1.Cmd.ofPromise(function () { return info.api.apply(info, args); }, function (data) {
                        return info.handleSuccess
                            ? runCustomAction(info.handleSuccess(key, data))
                            : actions[HandlerSuccess](key, data);
                    }, function (err) {
                        return info.handleError
                            ? runCustomAction(info.handleError(key, err))
                            : actions[HandlerError](key, err);
                    }))
                ];
            };
        };
    };
    for (var key in param) {
        _loop_1(key);
    }
    return {
        state: state,
        actions: actions,
    };
    var _a;
}
exports.default = Loadable;
//# sourceMappingURL=index.js.map