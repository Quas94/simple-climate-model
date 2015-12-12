/**
 * Main application source file.
 *
 * Contains all relevant Angular factories and services.
 */
var cmApp = angular.module('cmApp', [
		'ngRoute',
		'ngAnimate',
		'ngSanitize',
		'ui.bootstrap'
	]);

cmApp.controller('mainCtrl', ['$scope', '$rootScope', '$timeout', '$interval',
	function($scope, $rootScope, $timeout, $interval) {
		// check for the following and show warning message if any are not supported:
		// - web worker support
		// - object.keys
		if (typeof(Worker) === 'undefined' ||
			new Object().hasOwnProperty('keys')) { // @TODO check if this is a valid method for checking for support

			$('#warning-modal').modal('show');
		}
		// create web worker
		var worker = new Worker('./js/app/simulate.js');

		// fetch the default scenarios to begin with
		$scope.scenarios = DEFAULT_SCENARIOS;
		// fetch other relevant constants
		$scope.mainCharts = MAIN_CHARTS;
		$scope.secondaryCharts = SECONDARY_CHARTS;

		// make the first scenario active
		$scope.activeScenario = $scope.scenarios[0];
		$scope.activeScenario.active = true;

		// initial active charts are the last ones (ie. the base ones with relative positioning instead of absolute)
		$scope.mainChartActive = MAIN_CHARTS[MAIN_CHARTS.length - 1];
		$scope.secondaryChartActive = SECONDARY_CHARTS[SECONDARY_CHARTS.length - 1];
		// variable which marks whether or not charts are currently being displayed
		$scope.chartsActive = false;
		// the references to the currently displayed Chartist chart objects
		$scope.charts = null;

		// setup the heading/dropdowns
		$scope.secondaryHeading = $scope.secondaryChartActive.name;

		// create list of popup chart windows that have been created
		popupList = [];
		$scope.popupListLength = popupList.length;

		// opens a popup and passes in the chart to the new window
		// parameter main specifies whether to popup the main chart (true) or the secondary chart (false)
		$scope.popupChart = function(main) {
			// chartInfo is main chart or secondary chart depending on main parameter
			var chartInfo = main ? $scope.mainChartActive : $scope.secondaryChartActive;
			// work out chart popup window title
			var popupTitle = $scope.activeScenario.name + ': ' + chartInfo.name;

			// check if any existing popups have this title: if so, change focus to them and return early
			for (var i = 0; i < popupList.length; i++) {
				if (popupList[i].document.title === popupTitle) {
					popupList[i].focus();
					return;
				}
			}

			var plotInfo = document.getElementById(chartInfo.id).plotInfo;

			// set variables in this opener window for the popup to grab
			document.popupData = {
				info: chartInfo,
				years: plotInfo.y,
				data: plotInfo.data,
				title: popupTitle
			};
			// open the popup, which will access the values set above
			var popup = window.open('./chart', '_blank', 'menubar=0,toolbar=0,status=0,titlebar=0,location=0,width=1024,height=768');
			// add to list
			popupList.push(popup);
			$scope.popupListLength = popupList.length;
			var checkClose = $interval(function() {
				if (popup.closed) {
					$interval.cancel(checkClose); // clear timer
					var index = popupList.indexOf(popup);
					if (index > -1) {
						popupList.splice(index, 1); // remove from popup list
						$scope.popupListLength = popupList.length;
					}
				}
			}, 200);
		};

		// close all popups created by the popupChart() function
		$scope.closeAllPopups = function() {
			for (var i = 0; i < popupList.length; i++) {
				if (!popupList[i].closed) {
					popupList[i].close(); // close if not already closed
				}
			}
			// clear list of popup windows
			popupList = [];
			$scope.popupListLength = 0;
		};

		// sets the div corresponding to the given chart object to the visibility status which is also given
		$scope.setChartVisible = function(chart, visibility) {
			document.getElementById(chart.id).style.visibility = visibility ? VISIBLE : HIDDEN;
		};

		// changes currently active secondary chart to the given chart. updates visibility, etc
		$scope.selectSecondaryChart = function(chart) {
			// set old chart to be invisible
			$scope.setChartVisible($scope.secondaryChartActive, false);
			// set new chart to be active secondary chart, and make it visible
			$scope.secondaryChartActive = chart;
			$scope.setChartVisible(chart, true);
		};

		// destroys all previous charts
		$scope.destroyCharts = function() {
			// set charts to inactive
			$scope.chartsActive = false;

			// detach all charts
			if ($scope.charts != null) {
				for (var i = 0; i < $scope.charts.length; i++) {
					if ($scope.charts[i] !== '') { // placeholder added at the end to update binding
						$scope.charts[i].detach(); // ^ for more info, see $scope.runScenario->worker.onmessage
					}
				}
				$scope.charts = null;
			}
			// empty the chart div elements and set all to invisible
			for (var i = 0; i < $scope.mainCharts.length; i++) {
				$scope.setChartVisible($scope.mainCharts[i], false);
				document.getElementById($scope.mainCharts[i].id).innerHTML = '';
			}
			for (var i = 0; i < $scope.secondaryCharts.length; i++) {
				$scope.setChartVisible($scope.secondaryCharts[i], false);
				document.getElementById($scope.secondaryCharts[i].id).innerHTML = '';
			}
		};

		// select the given scenario (but doesn't run it)
		$scope.selectScenario = function(id) {
			// set charts to active upon first call
			$scope.chartsActive = true;

			// get the scenario with the given id
			foundScenario = null;
			for (var i = 0; i < $scope.scenarios.length; i++) {
				if ($scope.scenarios[i].id == id) {
					foundScenario = $scope.scenarios[i];
				}
			}
			// if scenario id was invalid, or same as the current active one, don't do anything and return early
			if (foundScenario == null || id == $scope.activeScenario.id) {
				return;
			}
			// destroy the current presentation of data
			$scope.destroyCharts();
			// change the active scenario
			$scope.activeScenario.active = false; // old active scenario is no longer active
			$scope.activeScenario = foundScenario;
			foundScenario.active = true;
		};

		// runs the currently active scenario
		$scope.runScenario = function() {
			// if it's the default scenario that is being run
			$scope.chartsActive = true;

			// activate the worker thread
			worker.postMessage({
				id: $scope.activeScenario.id,
				consts: SIM_CONSTS, 
				rcph: XLS_RCPH,
				rcphr: XLS_RCPH_ROWS,
				rcphc: XLS_RCPH_COLS,
				tline: TAU_LINE,
				tsi: XLS_TSI
			});
			// set to update page on recept of message from worker
			worker.onmessage = function(e) {
				if (e.data.type === 'update') {
					// update message - update progress bar
					var percent = e.data.percent;
					document.getElementById('simulation-progress-bar').style.width = percent + '%';
				} else if (e.data.type == 'finish') {
					// close modal progress bar
					$('#progress-modal').modal('hide');

					$timeout(function() {
						// fetch chart data and plot
						var retYears = e.data.y;
						var retData = e.data.charts;
						// set charts to new array
						$scope.charts = [];
						for (var i = 0; i < retData.length; i++) {
							// @TODO combined plotData and plotData2
							var newChart;
							var dataLen = retData[i].data.length;
							if (dataLen == 2) {
								newChart = plotData2(retData[i].id, retYears, retData[i].data[0], retData[i].data[1]);
							} else if (dataLen == 1) {
								newChart = plotData(retData[i].id, retYears, retData[i].data[0]);
							} else {
								throw new Error('dataLen = ' + dataLen);
							}
							$scope.charts.push(newChart);
							// link plot data to the element for use by popup window setup later
							document.getElementById(retData[i].id).plotInfo = { y: retYears, data: retData[i].data };
							// make the appropriate main and secondary chart divs visible
							$scope.setChartVisible($scope.mainChartActive, true);
							$scope.setChartVisible($scope.secondaryChartActive, true);
						}
					}, 0);
				} else {
					throw new Error('Invalid message type received from worker: ' + e.data.type);
				}
			};
		};

		$scope.isSidebarActive = function(active) {
			return active ? 'active' : '';
		};
	}]);

// page has fully loaded
angular.element(document).ready(function () {
	console.log('page has been fully loaded!');
});
