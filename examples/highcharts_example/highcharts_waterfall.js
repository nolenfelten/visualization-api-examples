(function() {
  var viz = {
    id: "highcharts_waterfall",
    label: "Waterfall",
    options: {
      chartName: {
        section: "Chart",
        label: "Chart Name",
        type: "string",
      },
      finalLabelOn: {
        section: "Waterfall",
        label: "Final Label On",
        type: "boolean",
        default: true,
        display_size: "half",
        order: 0,
      },
      finalLabel: {
        section: "Waterfall",
        label: "Final Label",
        type: "string",
        default: "Final",
        display_size: "half",
        order: 1,
      },
    },
    // Set up the initial state of the visualization
    create: function(element, config) {
      element.innerHTML = ""
    },
    // Render in response to the data or settings changing
    update: function(data, element, config, queryResponse) {
      if (!handleErrors(this, data, queryResponse, {
        min_pivots: 0, max_pivots: 0,
        min_dimensions: 1, max_dimensions: 1,
        min_measures: 1, max_measures: 1,
      })) return;

      function diff(a) {
        return a.slice(1).map(function(n, i) { return n - a[i]; });
      }

      let x = queryResponse.fields.dimension_like[0]
      let y = queryResponse.fields.measure_like[0]
      let xCategories = data.map(function(row) {return row[x.name].value})
      let seriesData = data.map(function(row) {return row[y.name].value})

      let totalColor = "#5245ed"
      let upColor = "#008000"
      let downColor = "#FF0000"
      // first element, deltas
      let deltas = [{y: seriesData[0], color: totalColor}]
        .concat(diff(seriesData))

      if (config.finalLabelOn) {
        xCategories.push(config.finalLabel)
        deltas.push({y: seriesData[seriesData.length - 1], color: totalColor, isSum: true,})
      }

      let series = [{
        upColor: upColor,
        color: downColor,
        data: deltas,
      }]

      let options = {
        credits: {
          enabled: false
        },
        chart: {type: 'waterfall'},
        title: {text: config.chartName},
        legend: {enabled: false},
        xAxis: {
          categories: xCategories,
        },
        yAxis: {
          title: {
            text: y.label_short ? y.label_short : y.label
          },
          labels: {
            formatter: function() {
              return `<b>${formatType(y.value_format, 0)(this.value)}</b>`
            }
          },
        },
        tooltip: {
          pointFormatter: function() {
            return `<b>${formatType(y.value_format)(this.y)}</b>`
          }
        },
        series: series,
      }
      let myChart = Highcharts.chart(element, options);
    }
  };
  looker.plugins.visualizations.add(viz);
}());