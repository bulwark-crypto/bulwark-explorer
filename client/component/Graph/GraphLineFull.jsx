
import Chart from 'chart.js';
import Component from '../../core/Component';
import isEqual from 'lodash/isEqual';
import numeral from 'numeral';
import PropTypes from 'prop-types';
import React from 'react';

export default class GraphLineFull extends Component {
  static defaultProps = {
    color: 'rgba(25, 145, 235, 1)',
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
    const data = this.props.data.map(d => numeral(d).value());

    let max = Math.max.apply(Math, data);
    let min = Math.min.apply(Math, data);
    max = max + (max * 0.1);
    min = min - (min * 0.1);

    // Setup the fill gradient.
    const canvas = document.getElementById(this.id);
    const ctx = canvas.getContext('2d');
    let gradientFill;
    if (ctx) {
      gradientFill = ctx.createLinearGradient(canvas.width/2, 0, canvas.width/2, canvas.height*2);
      gradientFill.addColorStop(0, "rgba(25, 145, 235, 0.6)");
      gradientFill.addColorStop(1, "rgba(25, 145, 235, 0.0)");
    } else {
      gradientFill = false;
    }

    return {
      type: 'line',
      data: {
        labels: this.props.labels,
        datasets: [{
          backgroundColor: gradientFill,
          borderColor: this.props.color,
          borderWidth: 2,
          cubicInterpolationMode: 'monotone', // default
          capBezierPoints: true,
          data: data,
          fill: true,
          lineTension: 0.05, // 0.55
          pointRadius: 2,
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
              display: true,
              drawBorder: true
            },
            pointLabels: {
              display: true
            },
            scaleLabel: {
              display: true
            },
            ticks: {
              stepSize: this.props.stepSize,
              suggestedMax: this.props.max || max,
              suggestedMin: this.props.min || min
            }
          }],
          yAxes: [{
            gridLines: {
              display: true,
              drawBorder: true
            },
            pointLabels: {
              display: true
            },
            scaleLabel: {
              display: true
            }
          }]
        },
        title: {
          display: true
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
          titleFontColor: '#565656',
          titleFontFamily: "'Source Sans Pro', sans-serif",
          titleFontSize: 12,
          xPadding: 10,
          yPadding: 10
        },
      }
    };
  };

  render() {
    return (
      <div style={{ height: this.props.height, width: this.props.width }}>
        <canvas id={ this.id } />
      </div>
    );
  };
}
