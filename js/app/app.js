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

		// create a copy of the default simulation constants to use as our 'global variables'
		$scope.globalVariables = objcpy(DEFAULT_SIM_CONSTS);
		// fetch the default scenarios to begin with
		$scope.standardActive = 'active'; // start with standard mode
		$scope.advancedActive = '';
		// make sure select input for create scenario modal always has access to default scenario list, to base new scenarios off of
		$scope.defaultScenarios = DEFAULT_SCENARIOS;
		$scope.scenarios = DEFAULT_SCENARIOS; // the current scenarios list. is either DEFAULT_SCENARIOS (can't be changed) or customScenarios
		var customScenarios = []; // list of custom scenarios
		var nextCustomScenarioId = 100; // start custom scenario ids from 100 onwards
		// fetch other relevant constants
		$scope.inputChartInfos = INPUT_CHART_INFOS;
		$scope.outputChartInfos = OUTPUT_CHART_INFOS;

		// make the first scenario active
		$scope.activeScenario = $scope.scenarios[0];
		$scope.activeScenario.active = true;

		// initial active charts are the last ones (ie. the base ones with relative positioning instead of absolute)
		$scope.inputChartActive = INPUT_CHART_INFOS[INPUT_CHART_INFOS.length - 1];
		$scope.outputChartActive = OUTPUT_CHART_INFOS[OUTPUT_CHART_INFOS.length - 1];
		// variable which marks whether or not charts are currently being displayed
		$scope.chartsActive = false;
		// the references to the currently displayed Chartist chart objects
		$scope.inputCharts = [];
		$scope.outputCharts = [];

		// setup the heading/dropdowns
		$scope.outputHeading = $scope.outputChartActive.name;

		// create list of popup chart windows that have been created
		var popupList = [];
		$scope.popupListLength = popupList.length;

		// model linked to input for new scenario name, and new scenario base
		$scope.createScenarioName = '';
		$scope.createScenarioBase = '0';

		// create a 2d array of keys of globalVariables. each first-dimensional element represents a column, and each second-dimensional
		// element holds the corresponding key of globalVariables in the position
		$scope.globalVarCols = [ [], [], [], [], [], [] ]; // 6 columns
		var globalKeys = Object.keys($scope.globalVariables);
		for (var i = 0; i < globalKeys.length; i++) {
			var col = i % 6; // 0 = col 1, 1 = col 2, 2 = col 3, 3 = col 4
			$scope.globalVarCols[col].push(globalKeys[i]); // push the key into the correct column
		}

		// forcing variables. separated from global variables
		$scope.forcings = objcpy(DEFAULT_FORCINGS);
		// forcing name descriptions
		$scope.forcingsNames = FORCINGS_NAMES;

		// gets forcing variable name (just appends 'F' to beginning)
		$scope.getForcingVar = function(n) {
			return 'F' + n;
		};

		// sets forcings to defaults
		$scope.setForcingDefaults = function() {
			$scope.forcings = objcpy(DEFAULT_FORCINGS);
		};

		// opens the edit globals modal. right now, only task is to set 'save' button to disabled
		$scope.openEditGlobals = function() {
			document.getElementById('edit-globals-save').disabled = true;
		};

		// fetches the values from $scope.globalVariables and pops them into the input fields
		$scope.updateGlobalsView = function() {
			// manually copy every element over
			var keys = Object.keys($scope.globalVariables);
			for (var i = 0; i < keys.length; i++) {
				document.getElementById('global-var-input-' + keys[i]).value = $scope.globalVariables[keys[i]];
			}
		};

		// sets all the input fields to the default values (but doesn't save, need user to click on save button)
		$scope.restoreDefaultGlobals = function() {
			// manually copy every element over
			var keys = Object.keys(DEFAULT_SIM_CONSTS);
			for (var i = 0; i < keys.length; i++) {
				document.getElementById('global-var-input-' + keys[i]).value = DEFAULT_SIM_CONSTS[keys[i]];
			}
			// set the 'save' button to enabled
			document.getElementById('edit-globals-save').disabled = false;
			// set restore defaults button to disabled
			document.getElementById('edit-globals-restore-defaults').disabled = true;
		};

		// if the save parameter is true, this function saves the values from the text input fields to the $scope.globalVariables object
		// otherwise, resets all the input fields to defaults
		$scope.closeGlobals = function(save) {
			// save if flag is set
			if (save) {
				// fetch values from inputs
				var keys = Object.keys($scope.globalVariables);
				for (var i = 0; i < keys.length; i++) {
					var value = document.getElementById('global-var-input-' + keys[i]).value;
					// @TODO: VALIDATION OF GLOBAL VAR INPUTS!!!
					$scope.globalVariables[keys[i]] = value;
					// no need to call updateGlobalsView since we saved
				}
			} else {
				// restore all the values
				$scope.updateGlobalsView();
			}
		};

		// opens a popup and passes in the chart to the new window
		// parameter 'input' specifies whether to popup the input chart (true) or the output chart (false)
		$scope.popupChart = function(input) {
			// chartInfo is input chart or output chart depending on 'input' parameter
			var chartInfo = input ? $scope.inputChartActive : $scope.outputChartActive;
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

		// changes currently active output chart to the given chart. updates visibility, etc
		$scope.selectOutputChart = function(chart) {
			// set old chart to be invisible
			$scope.setChartVisible($scope.outputChartActive, false);
			// set new chart to be active output chart, and make it visible
			$scope.outputChartActive = chart;
			$scope.setChartVisible(chart, true);
		};

		// destroys output charts only
		$scope.destroyOutputCharts = function() {
			// set charts to inactive
			$scope.chartsActive = false;
			// detach output charts
			if ($scope.outputCharts != null) {
				for (var i = 0; i < $scope.outputCharts.length; i++) {
					if ($scope.outputCharts[i] !== '') { // placeholder added at the end to update binding
						$scope.outputCharts[i].detach(); // ^ for more info, see $scope.runScenario->worker.onmessage
					}
				}
				$scope.outputCharts = [];
			}
			// empty output chart div elements and set to invisible
			for (var i = 0; i < $scope.outputChartInfos.length; i++) {
				$scope.setChartVisible($scope.outputChartInfos[i], false);
				document.getElementById($scope.outputChartInfos[i].id).innerHTML = '';
			}
		};

		// destroys both input and charts
		$scope.destroyCharts = function() {
			// call the destroy output charts function, then manually destroy input charts
			$scope.destroyOutputCharts();

			// detach input charts
			if ($scope.inputCharts != null) {
				for (var i = 0; i < $scope.inputCharts.length; i++) {
					if ($scope.inputCharts[i] !== '') { // placeholder added at the end to update binding
						$scope.inputCharts[i].detach(); // ^ for more info, see $scope.runScenario->worker.onmessage
					}
				}
				$scope.inputCharts = [];
			}
			// empty input chart div elements and set to invisible
			for (var i = 0; i < $scope.inputChartInfos.length; i++) {
				$scope.setChartVisible($scope.inputChartInfos[i], false);
				document.getElementById($scope.inputChartInfos[i].id).innerHTML = '';
			}
		};

		// allows for switching between standard and advanced modes (advanced mode allows creation of custom scenarios)
		$scope.changeMode = function(changeTo) {
			if (($scope.standardActive == 'active' && changeTo == 'standard') ||
				($scope.advancedActive == 'active' && changeTo == 'advanced')) {
				return; // trying to change to the same mode, don't do anything
			}
			// destroy charts before switching
			$scope.destroyCharts();

			// update the 'active' class in menu at top, and scenarios
			if (changeTo == 'standard') {
				$scope.standardActive = 'active';
				$scope.advancedActive = '';
				$scope.scenarios = DEFAULT_SCENARIOS;
				// tentatively set scenario to the first one, but override this with the scenario that has the 'active' flag
				// set to true, if any
				$scope.activeScenario = $scope.scenarios[0];
				for (var i = 0; i < $scope.scenarios.length; i++) {
					if ($scope.scenarios[i].active) {
						$scope.activeScenario = $scope.scenarios[i];
						break;
					}
				}
			} else if (changeTo == 'advanced') {
				$scope.standardActive = '';
				$scope.advancedActive = 'active';
				$scope.scenarios = customScenarios;
				if ($scope.scenarios == null || $scope.scenarios.length == 0) {
					$scope.activeScenario = null; // set to null
				} else {
					// tentatively set to first one, but override if any scenarios have 'active' flag set to true
					$scope.activeScenario = $scope.scenarios[0];
					for (var i = 0; i < $scope.scenarios.length; i++) {
						if ($scope.scenarios[i].active) {
							$scope.activeScenario = $scope.scenarios[i];
							break;
						}
					}
				}
			} else {
				throw new Error('Invalid parameter changeTo in $scope.changeMode: ' + changeTo);
			}
		};

		// select the given scenario (but doesn't run it)
		$scope.selectScenario = function(id) {
			// get the scenario with the given id
			var foundScenario = null;
			for (var i = 0; i < $scope.scenarios.length; i++) {
				if ($scope.scenarios[i].id == id) {
					foundScenario = $scope.scenarios[i];
					break;
				}
			}
			// if scenario id was invalid, or same as the current active one, don't do anything and return early
			if (foundScenario == null || ($scope.activeScenario != null && id == $scope.activeScenario.id)) {
				return;
			}
			// destroy the current presentation of data
			$scope.destroyCharts();
			// change the active scenario (originally active one could be null, if app is in advanced mode)
			if ($scope.activeScenario != null) {
				$scope.activeScenario.active = false;
			}
			$scope.activeScenario = foundScenario;
			$scope.activeScenario.active = true;

			// draw the input charts immediately
			var setup = simulationSetupReduced($scope.activeScenario.id);
			// @TODO: take forcing into account when drawing input charts
			// draw input charts
			var co2Chart = plotData($scope.inputChartActive.id, setup.years, [ setup.emissions.CO2 ]);
			// link plot data to the element for use by popup window setup later
			document.getElementById($scope.inputChartActive.id).plotInfo = { y: setup.years, data: [ setup.emissions.CO2 ] };
			$scope.inputCharts.push(co2Chart);
			// set input chart visible
			$scope.setChartVisible($scope.inputChartActive, true);
		};

		// draws the input chart of the initial activeScenario upon page load (same code as lines above)
		// needs to be in timeout to let the page load first
		$timeout(function() {
			var setup = simulationSetupReduced($scope.activeScenario.id);
			// @TODO: take forcing into account when drawing input charts
			var co2Chart = plotData($scope.inputChartActive.id, setup.years, [ setup.emissions.CO2 ]);
			document.getElementById($scope.inputChartActive.id).plotInfo = { y: setup.years, data: [ setup.emissions.CO2 ] };
			$scope.inputCharts.push(co2Chart);
			$scope.setChartVisible($scope.inputChartActive, true);
		}, 0);

		// runs the currently active scenario
		$scope.runScenario = function() {
			// if it's the default scenario that is being run
			$scope.chartsActive = true;

			// activate the worker thread
			worker.postMessage({
				id: $scope.activeScenario.id,
				consts: $scope.globalVariables,
				forcings: $scope.forcings,
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
					$timeout(function() {
						// close modal progress bar
						$('#progress-modal').modal('hide');
						// reset progress bar for next use
						document.getElementById('simulation-progress-bar').style.width = '0%';
						// fetch chart data and plot
						var retYears = e.data.y;
						var retData = e.data.charts;
						// set output charts to new array
						$scope.outputCharts = [];
						for (var i = 0; i < retData.length; i++) {
							var dataLen = retData[i].data.length;
							var newChart = plotData(retData[i].id, retYears, retData[i].data);
							$scope.outputCharts.push(newChart);
							// link plot data to the element for use by popup window setup later
							document.getElementById(retData[i].id).plotInfo = { y: retYears, data: retData[i].data };
							// make the output chart div visible
							$scope.setChartVisible($scope.outputChartActive, true);
						}
					}, 400);
				} else {
					throw new Error('Invalid message type received from worker: ' + e.data.type);
				}
			};
		};

		// creates a new scenario
		$scope.createScenario = function() {
			// temporary: just add a dummy scenario to the list
			if ($scope.scenarios === customScenarios) { // check that we do have the custom scenarios active right now
				// add to list of scenarios
				$scope.scenarios.push({
					id: nextCustomScenarioId,
					name: $scope.createScenarioName,
					isdefault: false,
				});
				// @TODO handle copying of base scenario
				console.log('base scenario is ' + $scope.createScenarioBase);
				// change to the newly created scenario
				$scope.selectScenario(nextCustomScenarioId);
				// increment next custom scenario id counter
				nextCustomScenarioId++;
			}
		};

		// try to delete the current scenario
		$scope.deleteScenario = function() {
			if ($scope.activeScenario.id < 100) {
				throw new Error('Trying to delete a scenario that is not custom, id = ' + $scope.activeScenario.id);
			}
			// delete scenario
			var index = $scope.scenarios.indexOf($scope.activeScenario);
			if (index < 0) {
				throw new Error('Currently active custom scenario (id = ' + $scope.activeScenario.id + ') is not in $scope.scenarios?');
			}
			$scope.scenarios.splice(index, 1);
			// pass active status to another custom scenario (if there are any left), and update $scope.activeScenario
			if ($scope.scenarios.length > 0) { // if there are still scenarios remaining
				if (index == $scope.scenarios.length) { // if it was the last item, we move index up by one. otherwise remains the same
					index--;
				}
				$scope.activeScenario = $scope.scenarios[index];
				$scope.activeScenario.active = true;
			} else {
				$scope.activeScenario = null; // set active scenario to null
			}
		};

		$scope.isSidebarActive = function(active) {
			return active ? 'active' : '';
		};

		$scope.clearNewScenario = function() {
			$scope.createScenarioName = '';
			$scope.createScenarioBase = '0'; // default option
		}
	}]);

// page has fully loaded
angular.element(document).ready(function () {
});

// on change of input fields in edit globals modal, enable save and restore buttons
var enableDefaultAndSaveButtons = function() {
	document.getElementById('edit-globals-save').disabled = false;
	document.getElementById('edit-globals-restore-defaults').disabled = false;
};
