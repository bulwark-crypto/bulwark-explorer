
import React from 'react';
import Component from 'core/Component';
import Actions from '../core/Actions';
import PropTypes from 'prop-types';
import { createChart } from 'lightweight-charts';
import { TimeIntervalType } from '../../lib/timeInterval'

export default class ChartComponent extends Component {
  static propTypes = {
    type: PropTypes.number.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      type: props.type,
      chart: null,
      lineSeries: null,

      chartElementWidth: 0,
      chartElementHeight: 0,
      chartHeight: 300
    }
  }

  handleResize = () => {
    this.resizeChart(this.state.chart);
  };
  resizeChart(chart) {
    const chartElementSize = { chartElementWidth: this.refs.chartElement.parentNode.offsetWidth, chartElementHeight: this.refs.chartElement.parentNode.offsetHeight };
    this.setState(chartElementSize);
    chart.resize(this.state.chartHeight, chartElementSize.chartElementWidth);
  }

  componentDidMount() {
    const chart = this.addChart();
    this.resizeChart(chart);

    window.addEventListener('resize', this.handleResize)

    Actions.getTimeIntervals({ type: this.state.type }).then(({ timeIntervals }) => {
      // Convert time interval data into TradingView charting data
      const tradingViewData = timeIntervals.map(timeInterval => ({ time: timeInterval.label, value: timeInterval.value }));
      this.setChartData(tradingViewData);
    });
  };

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
  }

  setChartData(tradingViewData) {
    const lineSeries = this.state.lineSeries;
    lineSeries.setData(tradingViewData);
  }

  addChart() {

    let priceFormat = {
      type: 'custom',
      precision: 0,
      formatter: (transactions) => `${transactions.toFixed(0)} BWK`
    }

    switch (this.state.type) {
      case TimeIntervalType.DailyAvgPosRoi:
        priceFormat = {
          type: 'custom',
          precision: 2,
          formatter: (transactions) => `${transactions.toFixed(2)}%`
        }
        break;
      case TimeIntervalType.DailyNonRewardTransactionsCount:
        priceFormat = {
          type: 'custom',
          precision: 0,
          formatter: (transactions) => `${transactions.toFixed(0)} TXs`
        }
        break;
    }


    const chartElement = this.refs.chartElement;
    const chart = createChart(chartElement, { width: 1179, height: this.state.chartHeight });
    const lineSeries = chart.addLineSeries();

    lineSeries.applyOptions({
      priceLineVisible: false,
      priceLineWidth: 3,
      priceLineColor: '#294dea',
      priceLineStyle: 3,

      baseLineColor: '#294dea',

      priceFormat
    });
    this.setState({ chart, lineSeries });

    return chart;
  }

  render() {
    return (<div><div ref="chartElement"></div></div>)
  }
}

