
import Actions from '../core/Actions';
import Component from '../core/Component';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import HorizontalRule from '../component/HorizontalRule';
import Table from '../component/Table';
import BitShares from 'btsdex-fix';
import CircularProgress from '@material-ui/core/CircularProgress';
import config from '../../../config'
class Market extends Component {
  static defaultProps = {
    coin: {}
  };

static propTypes = {
    coin: PropTypes.object.isRequired  
};

  constructor(props) {
    super(props);
    this.state = {
      cols: [
        { key: 'price', title: 'BTC' },
        { key: 'quantity', title: config.coinDetails.shortName },      ],
      orderbookasks:[],orderbookbids:[],orderdataret:[],loading : true,newrefresh: false
    };
  };

  fetchOrderBook = async(update) => {
    if(update){this.setState({newrefresh : true})}
    try {
      let quote = config.coinDetails.shortName
      let base = "BTC"
      quote =  `BRIDGE.${quote}`;
      base = `BRIDGE.${base}`;
    //Get orderbook data after connection to openledger WebSocket
      BitShares.subscribe('connected', async () => {
        const [baseId, basePres] = await BitShares.assets[base].then(r => [r.id, r.precision]);
        const [quoteId, quotePres] = await BitShares.assets[quote].then(r => [r.id, r.precision]);
        const data = await BitShares.db.get_limit_orders(baseId, quoteId, 300);
        const asks = {};
        const bids = {};
        const result = {
          bids: [],
          asks: [],
          type: 'snapshot',
          exchange: 'cryptobridge',
          symbol: config.coinDetails.shortName + "/BTC"
        };
        //Optimize data retrived
        data.forEach(el => {
          if (el.sell_price.base.asset_id === baseId) {
            let price =
              el.sell_price.base.amount / el.sell_price.quote.amount / 10 ** (basePres - quotePres);
            price = +price.toFixed(8);
            const volume = el.sell_price.quote.amount / 10 ** quotePres;
            if (Object.prototype.hasOwnProperty.call(bids, price)) {
              bids[price] += volume;
            } else {
              bids[price] = volume;
            }
          } else {
            let price =
              el.sell_price.quote.amount / el.sell_price.base.amount / 10 ** (basePres - quotePres);
            price = +price.toFixed(8);
            const volume = el.sell_price.base.amount / 10 ** quotePres;
            if (Object.prototype.hasOwnProperty.call(asks, price)) {
              asks[price] += volume;
            } else {
              asks[price] = volume;
            }
          }
        });
        //Sort the asks and bids,and set the data to state 
        result.asks = Object.keys(asks)
          .sort((a, b) => +a - +b)
          .map(price => [+price, asks[price]]);
        result.bids = Object.keys(bids)
          .sort((a, b) => +b - +a)
          .map(price => [+price, bids[price]]);
          this.setState({orderdataret: result})
          this.setState({ orderbookasks: this.state.orderdataret.asks });
          this.setState({ orderbookbids: this.state.orderdataret.bids });
          //if update after initial load,set newrefresh to show the circular progress while fetching change in orderbook
          if(update){
       this.setState({newrefresh : false})}
          else{
          this.setState({ loading: false });}

      });
    } catch (e) {
      this.setState({ err: e.message })
    } 
  }

  async componentDidMount() {
    await BitShares.connect();
    //Initial OrderBook fetch
    await this.fetchOrderBook(false);
      //Update on each new block created on bitshares chain
      BitShares.subscribe('block', async () => {
        this.setState({newrefresh : false})
        await  this.fetchOrderBook(true);
      });
  };

  render() {
    if(!this.state.loading){
      return (
        <div>
          <div style={this.state.newrefresh ? {display: 'flex',  justifyContent:'center', alignItems:'center'} : {alignItems:'center' }} className={this.state.newrefresh ? '' : 'hidden'}><CircularProgress /></div>
      <div className="row">
      <div className="col">
      <HorizontalRule title="Buy Orders" />         
         <Table
           cols={ this.state.cols }
           data={ this.state.orderbookbids.map((order, idx) => ({
             ...order,
             price: order[0],
             quantity: order[1] ,
           })) } />
      </div>
      <div className="col">
      <HorizontalRule title="Sell Orders" />
        <Table
          cols={ this.state.cols }
          data={ this.state.orderbookasks.map((order, idx) => ({
            ...order,
            price: order[0],
            quantity: order[1] ,
          })) } />
      </div>
    </div>
    </div>
    );
    }
    else if (this.state.loading) {
      return this.renderLoading();
    }
  };
}

const mapState = state => ({
  coin: state.coin
});

export default connect(mapState)(Market);