import Component from 'core/Component';
import React from 'react';
import Actions from '../core/Actions';
import CountUpComponent from 'react-countup';
import { createChart } from 'lightweight-charts';

export default class ChartComponent extends Component {

  componentDidMount() {

    Actions.getTimeIntervals().then(({ timeIntervals }) => {

      // Convert time interval data into TradingView charting data
      const tradingViewData = timeIntervals.map(timeInterval => ({ time: timeInterval.label, value: timeInterval.value }))
      this.addChart(tradingViewData);
    });
  };

  addChart(tradingViewData) {
    //chart.resize(250, 150);//@todo

    const chartElement = this.refs.chartElement;
    const chart = createChart(chartElement, { width: '1179', height: 300 }); //@todo resizing
    const lineSeries = chart.addLineSeries();
    lineSeries.applyOptions({
      priceLineVisible: false,
      priceLineWidth: 3,
      priceLineColor: '#294dea',
      priceLineStyle: 3,

      baseLineColor: '#294dea',
    });
    lineSeries.setData(tradingViewData);
  }

  render() {
    return (<div ref="chartElement"></div>)
  }
}

