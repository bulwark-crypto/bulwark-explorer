
import Chart from 'chart.js';
import Component from '../../core/Component';
import PropTypes from 'prop-types';
import React from 'react';

export default class GraphLine extends Component {
  static defaultProps = {
    color: 'rgba(0,255,0,1)',
    data: [],
    height: '50px',
    hideLines: false,
    labels: [],
    width: '300px'
  };

  static propTypes = {
    color: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    hideLines: PropTypes.bool.isRequired,
    labels: PropTypes.array.isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  };

  constructor(props) {
    super(props);

    this.id = this.randomString();
  };

  componentDidMount() {
    const el = document.getElementById(this.id);
    const chart = new Chart(el, {
      type: 'line',
      data: {
        labels: this.props.labels,
        datasets: [{
          borderColor: [this.props.color],
          borderWidth: 2,
          cubicInterpolationMode: 'default', // monotone
          data: this.props.data,
          fill: false,
          //lineTension: 1,
          pointRadius: 0,
          steppedLine: false
        }]
      },
      options: {
        layout: {
          padding: 10
        },
        legend: {
          display: !this.props.hideLines
        },
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          xAxes: [{
            gridLines: {
              display: !this.props.hideLines,
              drawBorder: !this.props.hideLines
            },
            pointLabels: {
              display: !this.props.hideLines
            },
            scaleLabel: {
              display: !this.props.hideLines
            },
            ticks: {
              callback: () => null
            }
          }],
          yAxes: [{
            gridLines: {
              display: !this.props.hideLines,
              drawBorder: !this.props.hideLines
            },
            pointLabels: {
              display: !this.props.hideLines
            },
            scaleLabel: {
              display: !this.props.hideLines
            },
            ticks: {
              callback: () => null
            }
          }]
        },
        title: {
          display: !this.props.hideLines
        }
      }
    });
  };

  render() {
    return (
      <div style={{ height: this.props.height, width: this.props.width }}>
        <canvas id={ this.id } />
      </div>
    );
  };
}
