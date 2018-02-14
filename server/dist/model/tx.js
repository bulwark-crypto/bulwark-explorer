'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _mongorito = require('mongorito');

var _mongorito2 = _interopRequireDefault(_mongorito);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TX = function (_mongorito$Model) {
    _inherits(TX, _mongorito$Model);

    function TX() {
        _classCallCheck(this, TX);

        return _possibleConstructorReturn(this, (TX.__proto__ || Object.getPrototypeOf(TX)).apply(this, arguments));
    }

    return TX;
}(_mongorito2.default.Model);

exports.default = TX;