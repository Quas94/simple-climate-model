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

cmApp.controller('mainCtrl', ['$scope', '$rootScope',
	function($scope, $rootScope) {
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
