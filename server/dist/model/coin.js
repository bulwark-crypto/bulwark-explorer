'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongorito = require('mongorito');

var _mongorito2 = _interopRequireDefault(_mongorito);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Coin extends _mongorito2.default.Model {}
exports.default = Coin;