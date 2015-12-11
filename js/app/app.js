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

cmApp.controller('mainCtrl', ['$scope', '$rootScope', '$interval',
	function($scope, $rootScope, $interval) {
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

		// setup the heading/dropdowns
		$scope.secondaryHeading = $scope.secondaryChartActive.name;

		// create list of popup chart windows that have been created
		popupList = [];
		$scope.popupListLength = popupList.length;

		// opens a popup and passes in the chart to the new window
		// parameter main specifies whether to popup the main chart (true) or the secondary chart (false)
		$scope.popupChart = function(main) {
			var chartInfo;
			var chart;
			if (main) {
				// main chart
				chartInfo = $scope.mainChartActive;
			} else {
				// secondary chart
				chartInfo = $scope.secondaryChartActive;
			}

			var plotInfo = document.getElementById(chartInfo.id).plotInfo;

			// set variables in this opener window for the popup to grab
			document.popupData = {
				info: chartInfo,
				years: plotInfo.y,
				data: plotInfo.data,
				title: $scope.activeScenario.name + ': ' + chartInfo.name
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

		// select the given scenario
		$scope.selectScenario = function(id) {
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
			// change the active scenario
			$scope.activeScenario.active = false; // old active scenario is no longer active
			$scope.activeScenario = foundScenario;
			foundScenario.active = true;
			// @TODO update scenario data in main page
			// instead of just running the scenario instantly (as follows):
			var charts = simulate(id);
			// make the appropriate main and secondary chart divs visible
			$scope.setChartVisible($scope.mainChartActive, true);
			$scope.setChartVisible($scope.secondaryChartActive, true);
		};

		$scope.isSidebarActive = function(active) {
			return active ? 'active' : '';
		};
	}]);

// page has fully loaded
angular.element(document).ready(function () {
	console.log('page has been fully loaded!');
});
