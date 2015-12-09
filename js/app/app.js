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

		// make the first scenario active
		$scope.activeScenario = $scope.scenarios[0];
		$scope.activeScenario.active = true;

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
			simulate(id);
		};

		$scope.isActive = function(active) {
			return active ? 'active' : '';
		};
	}]);

// page has fully loaded
angular.element(document).ready(function () {
	console.log('page has been fully loaded!');
});
