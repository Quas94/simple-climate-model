/**
 * Source that contains a bunch of functions for charting data.
 */

// constants for bootstrap widths (xs, sm, md, lg) in pixels
var BOOTSTRAP_MIN_WIDTH_MD = 992;

// returns a set of options
var getChartOptions = function(units) {
	// work out width and height of chart
	var winWidth = window.innerWidth;
	var winHeight = window.innerHeight;
	var width;
	if (winWidth >= BOOTSTRAP_MIN_WIDTH_MD) {
		// we're on the larger setting
		var sidebarWidth = winWidth / 12; // sidebar takes 1 column only
		width = Math.round((winWidth - sidebarWidth) / 2 * 0.9); // ~10% of space reserved for labels, margins etc
	} else {
		// @TODO smaller settings
	}
	// height is 67% of width (for now)
	var height = Math.round(width / 3 * 2);

	// units of measurement on y-axis
	if (typeof units === 'undefined') {
		units = 'not defined';
	}

	// construct options object
	var options = {
		width: width,
		height: height,
		showPoint: false,
		chartPadding: {
			right: 30 // so the labels on the far right don't get cut off
		},
		lineSmooth: Chartist.Interpolation.simple({
			divisor: 5
		}),
		plugins: [
			Chartist.plugins.ctAxisTitle({
				axisX: {
					axisTitle: 'Years',
					axisClass: 'ct-axis-title',
					offset: {
						x: 0,
						y: 35
					},
					textAnchor: 'middle'
				},
				axisY: {
					axisTitle: units,
					axisClass: 'ct-axis-title',
					offset: {
						x: 0,
						y: 12
					},
					textAnchor: 'middle',
					flipTitle: true
				}
			})
		],
	};
	return options;
};

/**
 * Plots the set of data on the page (onto the div element with the given id).
 * Automatically detects the number of sets of data and deals with it accordingly.
 */
var plotData = function(chartId, years, data, popup, units) {
	// make sure that data series lengths are all equivalent, and same as years length
	for (var i = 0; i < data.length; i++) {
		// console.log('data = ' + JSON.stringify(data));
		if (data[i].length != years.length) {
			throw new Error('data length = ' + data[i].length + ' (i = ' + i + '), years.length = ' + years.length);
		}
	}

	var options = getChartOptions(units);

	// if this is plotting a popup chart, override default chart options size
	if (typeof popup !== 'undefined' && popup) {
		// console.log('Setting popup dimensions! innerWidth = ' + window.innerWidth);
		options.width = Math.round(window.innerWidth * 0.9);
		options.height = Math.round(options.width / 4 * 2.75); // a little less than 3 quarters, because of panel title height
	}
	// else console.log('Setting normal dimensions.');

	var plot = {
		labels: [],
		series: []
	};

	for (var i = 0; i < data.length; i++) {
		var s = [];
		for (var j = 0; j < data[i].length; j++) {
			s[j] = data[i][j];
		}
		plot.series.push(s);
	}

	// fill labels with years
	var nextYear = 0;
	var numLabels = 10; // number of labels we want to display along the x axis
	var yearInc = years.length / numLabels;
	for (var i = 0; i < years.length; i++) {
		plot.labels[i] = '';
		if (i == Math.round(nextYear)) {
			nextYear += yearInc;
			plot.labels[i] = Math.round(years[i]);
		}
	}
	// add the last label (on top of numLabels) manually
	plot.labels.push(years[Math.floor(nextYear)]);

	// actually render
	return new Chartist.Line('#' + chartId, plot, options);
};

/**
 * Plots an empty chart into the div with the given id.
 *
 * @TODO make this 'empty' chart truly empty, and prettier
 */
var plotEmptyChart = function(chartId, units) {
	var options = getChartOptions(units);
	var plot = {
		labels: [ 0 ],
		series: [ [ 0 ] ]
	};
	// actually render
	return new Chartist.Line('#' + chartId, plot, options);
};
