/**
 * Source that contains a bunch of functions for charting data.
 */

 // returns a set of options
var getChartOptions = function() {
	// chart dimensions and other options
	var options = {
		width: 720,
		height: 480,
		chartPadding: {
			right: 30 // so the text at the right hand side doesn't get cut off
		},
	};
	return options;
};

// @TODO make generic version of plotData function which takes in 'data' as an array of data arrays
// @TODO make x-axis labels land on rounder, nicer numbers
// plots the singular set of data given, onto the div with the given id
var plotData = function(chartId, years, d) {
	// get default options
	var options = getChartOptions();

	// plot single set of data
	var data = {
		labels: [],
		series: [ [] ]
	};
	// fill labels and data
	for (var i = 0; i < years.length; i++) {
		data.labels[i] = '';
		if (i % 80 == 0) { // 10 labels on the y-axis, since simulate.reduce() functions reduce datasets to 800 elements
			data.labels[i] = years[i];
		}
		data.series[0][i] = d[i];
	}
	// draw data
	return new Chartist.Line('#' + chartId, data, options);
};

// plots the 2 sets of data that are given, onto the div with the given id
// returns reference to the new Chartist chart object
var plotData2 = function(chartId, years, data1, data2) {
	// get default options
	var options = getChartOptions();

	// plot surface temperature
	// create data object
	var data = {
		labels: [],
		series: [ [], [] ] // internal arrays are surface-temp and ocean-temp
	};

	// fill labels and data
	for (var i = 0; i < years.length; i++) {
		data.labels[i] = '';
		if (i % 80 == 0) { // only show year label every 10 years
			data.labels[i] = years[i];
		}
		// surface temperature
		data.series[0][i] = data1[i];
		// ocean temperature
		data.series[1][i] = data2[i];
	}
	// draw temperatures
	return new Chartist.Line('#' + chartId, data, options);
}
