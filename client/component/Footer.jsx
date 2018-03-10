
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from './Icon';

/**
 * Will use material icons to render.
 * @param {Object} props The props with the name.
 */
class Footer extends Component {
  static propTypes = {
    coins: PropTypes.array.isRequired,
    txs: PropTypes.array.isRequired,
  };

  render() {
    const coin = this.props.coins && this.props.coins.length ? this.props.coins[0] : { status: 'offline', blocks: 0 };
    const blocks = this.props.txs && this.props.txs.length ? this.props.txs[0].blockHeight : coin.blocks;
    const statusColor = (coin.status && coin.status.toLowerCase() === 'online') ? 'green' : 'red';

    return (
      <div className="footer">
        <div className="footer__wrapper">
            <div className="footer__data-wrapper">
                <img className="footer__logo" src="/img/Layer 1945.png" />
                <span className="footer__data-block footer__legal">
                  <p>Copyright &copy; 2018 Bulwark Cryptocurrency</p>
                  <p>Site design / Logo &copy; 2018 Bulwark Cryptocurrency</p>
                  <p>User contributions licensed under cc by-sa 3.0 with attribution required</p>
                </span>
            </div>
            <div className="footer__data-wrapper">
                <div className="footer__data-block">
                  <p className="footer__title">Status</p>
                  <p>
                    <span className={ `u__dot u--text-${ statusColor }` }>&bull;</span>
                    <span className="footer__title">{ coin.status }</span>
                  </p>
                </div>
                <div className="footer__data-block">
                  <p className="footer__title">Blocks</p>
                  <p><b>{ blocks }</b></p>
                </div>
            </div>
            <div className="footer__data-block">
              <p className="footer__title">Social Media</p>
              <div className="footer__social-media-wrapper">
                <a href="https://bitcointalk.org/index.php?topic=2499481.0" target="_blank">
                  <Icon name="bitcoin" className="fab footer__social-media-icon" />
                </a>
                <a href="https://www.reddit.com/r/BulwarkCoin/" target="_blank">
                  <Icon name="reddit" className="fab footer__social-media-icon" />
                </a>
                <a href="https://github.com/bulwark-crypto" target="_blank">
                  <Icon name="github" className="fab footer__social-media-icon" />
                </a>
                <a href="https://twitter.com/BulwarkCoin" target="_blank">
                  <Icon name="twitter" className="fab footer__social-media-icon" />
                </a>
                <a href="http://facebook.com/bulwark.coin.IO/" target="_blank">
                  <Icon name="facebook" className="fab footer__social-media-icon" />
                </a>
              </div>
            </div>
        </div>
      </div>
    );
  };
};

const mapState = state => ({
  coins: state.coins,
  txs: state.txs,
});

export default connect(mapState)(Footer);
