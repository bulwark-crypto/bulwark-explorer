'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

require('babel-polyfill');

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _mongorito = require('mongorito');

var _mongorito2 = _interopRequireDefault(_mongorito);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _middleware = require('./middleware');

var _middleware2 = _interopRequireDefault(_middleware);

var _api = require('./route/api');

var _api2 = _interopRequireDefault(_api);

var _file = require('./route/file');

var _file2 = _interopRequireDefault(_file);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
// Middleware

// Routes


// Connect to the database.
const dsn = `${_config2.default.db.user}:${_config2.default.db.pass}@${_config2.default.db.host}:${_config2.default.db.port}/${_config2.default.db.name}`;
const db = new _mongorito2.default.Database(`mongodb://${dsn}`);
const res = (() => {
    var _ref = _asyncToGenerator(function* () {
        return yield db.connect();
    });

    return function res() {
        return _ref.apply(this, arguments);
    };
})();

// Setup the application.
const app = (0, _express2.default)();

// Setup middleware for app.
(0, _middleware2.default)(app);

// Setup the routes.
app.get('/', _file2.default);
app.use('/api', _api2.default);

// Start the server.
app.listen(_config2.default.port, () => {
    console.log(`BlocEx running on port ${_config2.default.port}`);
});

exports.default = app;