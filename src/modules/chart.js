import ChartJS from 'chart.js';

class Chart {
  constructor(config) {
    this.config = config;
    this.chart = null;

    this.init()
  }

  init() {
    this.cache();
    this.initChart();

    return this;
  }

  cache() {
    this.win = window;
    this.html = document.querySelector('html');
    this.body = this.html.querySelector('body');
    this.chartElement = this.body.querySelector('[data-chart]');

    if (this.chartElement) {
      this.chartElementContext = this.chartElement.getContext('2d')
    }
  }

  initChart() {
    this.chart = new ChartJS(this.chartElementContext, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'First dataset',
            backgroundColor: "rgb(255, 99, 132)",
            borderColor: "rgb(255, 99, 132)",
            data: [],
            fill: false,
            yAxisID: 'y-axis-1'
          },
          {
            label: 'Second dataset',
            backgroundColor: "rgb(75, 192, 192)",
            borderColor: "rgb(75, 192, 192)",
            data: [],
            fill: false,
            yAxisID: 'y-axis-2'
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          yAxes: [
            {
              type: 'linear',
              display: true,
              position: 'left',
              id: 'y-axis-1'
            },
            {
              type: 'linear',
              display: true,
              position: 'right',
              id: 'y-axis-2'
            }
          ],
          xAxes: [{
            type: 'time'
          }]
        }
      }
    });
  }

  updateChart(newData) {
    var self = this;

    // add new label at end
    newData.forEach(function (item) {
      self.chart.config.data.labels.push(new Date(item.timestamp));
    });

    // add new data at end
    this.chart.data.datasets.forEach(function(dataset, index) {
      newData.forEach(function (item) {
        dataset.data.push(item['value' + (index + 1)]);
      });
    });

    this.chart.update();
  }
}

export default Chart;