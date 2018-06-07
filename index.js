;(function (window, document, undefined) {
  'use strict';

  var ChartModule = {
    init: function (config) {
      this.config = config;

      this.chart = null;

      this.cache();
      this.initChart();
      this.updateChartData(this.requestCount);

      return this;
    },

    cache: function () {
      this.win = window;
      this.html = document.querySelector('html');
      this.body = this.html.querySelector('body');
      this.chartElement = this.body.querySelector('[data-chart]');

      this.requestCount = 0;
      this.requestLimit = 6;

      this.refreshData = false;

      if (this.chartElement) {
        this.chartElementContext = this.chartElement.getContext('2d')
      }
    },

    initChart: function() {
      this.chart = new Chart(this.chartElementContext, {
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
    },

    updateChartData: function (requestIndex) {
      var self = this;

      var url = './data/dataset' + requestIndex + '.json';

      this.getData(url, 'GET').then(function (response) {
        var data = JSON.parse(response).data;

        if (!data.length) {
          console.log('No data');

          return false;
        }

        self.moveChart(self.chart, data, self.refreshData);

        if (self.requestCount < self.requestLimit) {
          self.requestCount++;
        } else {
          self.refreshData = true;
          self.requestCount = 0;
        }


        setTimeout(function () {
            self.updateChartData(self.requestCount);
          }, 3000);
      }, function (error) {
        console.log(error);
      });
    },

    moveChart: function (chart, newData, refreshData) {
      if (refreshData) {
        chart.config.data.labels = newData.map(function (item) {
          return new Date(item.timestamp);
        });

        chart.data.datasets.forEach(function(dataset, index) {
          dataset.data = newData.map(function (item) {
            return item['value' + (index + 1)];
          });
        });

        this.refreshData = false;
      } else {
        // add new label at end
        newData.forEach(function (item) {
          chart.config.data.labels.push(new Date(item.timestamp));
        });

        // add new data at end
        chart.data.datasets.forEach(function(dataset, index) {
          newData.forEach(function (item) {
            dataset.data.push(item['value' + (index + 1)]);
          });
        });
      }

      chart.update();
    },

    getData: function (url, method, data) {
      var self = this;
      if (!data) {
        data = {};
      }

      return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();

        if (method === 'GET' && self.serializeData(data).length) {
          url += '?' + self.serializeData(data);
        }

        xhr.open(method, url, true);

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 204 || xhr.status === 200) {
              resolve(this.response);
            } else {
              var error = new Error(this.statusText);
              error.code = this.status;

              reject(error);
            }
          }
        };

        if (method === 'GET') {
          xhr.send();
        } else {
          xhr.send(JSON.stringify(data));
        }
      });
    },

    serializeData: function (data) {
      var str = [];
      Object.keys(data).forEach((item) => {
        if (Object.prototype.hasOwnProperty.call(data, item)) {
          str.push(encodeURIComponent(item) + '=' + encodeURIComponent(data[item]));
        }
      });

      return str.join('&');
    }
  };

  ChartModule.init();

})(window, document);

// function moveChart(chart, newData) {
//     chart.data.labels.push('new label'); // add new label at end
//     chart.data.labels.splice(0, 1); // remove first label

//     chart.data.datasets.forEach(function(dataset, index) {
//         dataset.data.push(newData[index]); // add new data at end
//         dataset.data.splice(0, 1); // remove first data point
//     });

//     chart.update();
// }