
import Component from 'core/Component';
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
    coins: PropTypes.array,
  };

  render() {
    const coin = this.props.coins && this.props.coins.length
    ? this.props.coins[0]
    : { status: 'offline', blocks: 0 };

    const statusColor = (coin.status && coin.status.toLowerCase() === 'online') ? 'green' : 'red';

    return (
      <div className="footer">
        <div className="footer__wrapper">
            <div className="footer__data-wrapper">
                <img src="https://bulwarkcrypto.com/wp-content/uploads/2018/01/bulwark_footer.png" className="footer__logo" />
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
                  <p><b>{ coin.blocks }</b></p>
                </div>
            </div>
            <div className="footer__data-block">
              <p className="footer__title">Social Media</p>
              <div className="footer__social-media-wrapper">
                <a href="#">
                  <Icon name="envelope-square" className="footer__social-media-icon" />
                </a>
                <a href="#">
                  <Icon name="reddit" className="
                  fab footer__social-media-icon" />
                </a>
                <a href="#">
                  <Icon name="github" className="
                  fab footer__social-media-icon" />
                </a>
                <a href="#">
                  <Icon name="twitter" className="
                  fab footer__social-media-icon" />
                </a>
                <a href="#">
                  <Icon name="facebook" className="
                  fab footer__social-media-icon" />
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
