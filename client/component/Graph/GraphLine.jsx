
import Chart from 'chart.js';
import Component from '../../core/Component';
import isEqual from 'lodash/isEqual';
import PropTypes from 'prop-types';
import React from 'react';

export default class GraphLine extends Component {
  static defaultProps = {
    color: 'rgba(0,255,0,1)',
    data: [],
    labels: []
  };

  static propTypes = {
    color: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    labels: PropTypes.array.isRequired,
    max: PropTypes.number,
    min: PropTypes.number,
    stepSize: PropTypes.number,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  };

  constructor(props) {
    super(props);

    this.chart = null;
    this.id = this.randomString();
  };

  componentDidMount() {
    const el = document.getElementById(this.id);

    // Change the clip area for the graph to avoid
    // peak and valley cutoff.
    Chart.canvasHelpers.clipArea = (ctx, clipArea) => {
      ctx.save();
      ctx.beginPath();
      ctx.rect(
        clipArea.left,
        clipArea.top - 5,
        clipArea.right - clipArea.left,
        clipArea.bottom + 5
      );
      ctx.clip();
    };

    this.chart = new Chart(el, this.getConfig());
  };

  componentDidUpdate(prevProps) {
    if (!isEqual(this.props.data, prevProps.data)) {
      const config = this.getConfig();
      this.chart.config.data = config.data;
      this.chart.update();
    }
  };

  componentWillUnmount() {
    this.chart.destroy();
  };

  getConfig = () => {
    let max = Math.max(this.props.data);
    let min = Math.min(this.props.data);
    max = max + (max * 0.1);
    min = min - (min * 0.1);

    return {
      type: 'line',
      data: {
        labels: this.props.labels,
        datasets: [{
          borderColor: this.props.color,
          borderWidth: 3,
          cubicInterpolationMode: 'monotone', // default
          capBezierPoints: true,
          data: this.props.data,
          fill: false,
          lineTension: 0.55,
          pointRadius: 0,
          showLine: true,
          spanGaps: true,
          steppedLine: false
        }]
      },
      options: {
        layout: {
          padding: {
            bottom: 5,
            left: 0,
            right: 0,
            top: 5
          }
        },
        legend: {
          display: false,
          position: 'bottom'
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            gridLines: {
              display: false,
              drawBorder: false
            },
            pointLabels: {
              display: false
            },
            scaleLabel: {
              display: false
            },
            ticks: {
              callback: () => null,
              stepSize: this.props.stepSize,
              suggestedMax: this.props.max || max,
              suggestedMin: this.props.min || min
            }
          }],
          yAxes: [{
            gridLines: {
              display: false,
              drawBorder: false
            },
            pointLabels: {
              display: false
            },
            scaleLabel: {
              display: false
            },
            ticks: { callback: () => null }
          }]
        },
        title: {
          display: false
        },
        tooltips: {
          backgroundColor: 'white',
          bodyFontColor: '#161616',
          bodyFontFamily: "'bariol', sans-serif",
          bodyFontSize: 16,
          bodyFontStyle: 'bold',
          borderColor: '#cccccc',
          borderWidth: 1,
          displayColors: false,
          enabled: false,
          titleFontColor: '#565656',
          titleFontFamily: "'Source Sans Pro', sans-serif",
          titleFontSize: 12,
          xPadding: 10,
          yPadding: 10
        }
      }
    };
  };

  render() {
    return (
      <div
        className={ `${ this.props.className ? this.props.className : '' }` }
        style={{ height: this.props.height, width: this.props.width }}>
        <canvas id={ this.id } />
      </div>
    );
  };
}
