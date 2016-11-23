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

cmApp.directive('helpPage', function() {
	return {
		templateUrl: 'help.html',
		scope: {
			user: '=data'
		},
		restrict: 'E'
	};
});

cmApp.directive('aboutPage', function() {
	return {
		templateUrl: 'about.html',
		scope: {
			user: '=data'
		},
		restrict: 'E'
	};
});

cmApp.controller('mainCtrl', ['$scope', '$rootScope', '$timeout', '$interval',
	function($scope, $rootScope, $timeout, $interval) {
		// check for the following and show warning message if any are not supported:
		// - web worker support
		// - object.keys
		if (typeof(Worker) === 'undefined' ||
			new Object().hasOwnProperty('keys')) {

			$('#warning-modal').modal('show');
		}
		// create web worker
		var worker = new Worker('./js/app/simulate.js');

		// create a copy of the default simulation constants to use as our 'global variables'
		$scope.globalVariables = objcpy(DEFAULT_SIM_CONSTS);
		// whether the app is in standard mode or advanced mode
		$scope.standardActive = 'active'; // start with standard mode
		$scope.advancedActive = '';
		// make sure select input for create scenario modal always has access to default scenario list, to base new scenarios off of
		$scope.defaultScenarios = DEFAULT_SCENARIOS;
		$scope.scenarios = DEFAULT_SCENARIOS; // the current scenarios list. is either DEFAULT_SCENARIOS (can't be changed) or customScenarios
		var customScenarios = []; // list of custom scenarios
		var nextCustomScenarioId = CUSTOM_SCENARIO_ID_START; // start custom scenario ids from 100 onwards
		var customScenarioData = []; // stores objects containing data for custom scenarios
		// fetch other relevant constants
		$scope.inputChartInfos = INPUT_CHART_INFOS;
		$scope.outputChartInfos = OUTPUT_CHART_INFOS;
		// fetch default scenario descriptions
		$scope.descriptions = DESCRIPTIONS;

		// make the first scenario active
		$scope.activeScenario = $scope.scenarios[0];
		$scope.activeScenario.active = true;

		// initial active charts
		$scope.inputChartActive = INPUT_CHART_INFOS[0]; // CO2 emissions
		$scope.outputChartActive = OUTPUT_CHART_INFOS[OUTPUT_CHART_INFOS.length - 1]; // surface and ocean temperatures
		// variable which marks whether or not charts are currently being displayed
		$scope.chartsActive = false;
		// the references to the currently displayed Chartist chart objects
		$scope.inputCharts = [];
		$scope.outputCharts = [];
		// whether or not the currently chosen scenario has been run
		$scope.scenarioHasRun = false;

		// setup the heading/dropdowns
		$scope.outputHeading = $scope.outputChartActive.name;

		// create list of popup chart windows that have been created
		var popupList = [];
		$scope.popupListLength = popupList.length;

		// model linked to import modal
		$scope.createScenarioName = '';
		$scope.createScenarioDesc = '';
		$scope.importScenario = {};

		// modes of the edit custom inputs modal
		$scope.EDIT_MODE_INITIAL = 0;
		$scope.EDIT_MODE_FORM = 1;
		$scope.EDIT_MODE_CONFIRM = 2;
		// current mode of the edit custom inputs modal
		$scope.editCustomInputsMode = $scope.EDIT_MODE_INITIAL;
		// input model variables
		$scope.editCustomInputsFields = {};
		// error message field for editing custom inputs
		$scope.editCustomInputsError = '';
		// success message field for editing custom inputs
		$scope.editCustomInputsSuccess = '';
		// holds the backed up copy of data for editing custom scenarios
		$scope.editCustomInputsBackup = null;
		// flag for whether or not changes were made in the edit custom data modal
		$scope.editCustomInputsChanged = false;

		// custom scenario settings
		$scope.customScenarioYears = {};
		$scope.editScenarioSettingsError = '';
		$scope.editScenarioSettingsWarning = '';
		// default scenario years range
		var defaultScenarioYearsRange = '';

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

		// determines whether or not this input chart's forcing is enabled (and thus, whether or not this
		// chart can be displayed)
		$scope.isInputChartForcingEnabled = function(eid) {
			// determine the varname of this chart
			var varname = '';
		    for (var i = 0; i < INPUT_CHART_INFOS.length; i++) {
		        if (INPUT_CHART_INFOS[i].id === eid) {
		            varname = INPUT_CHART_INFOS[i].varname;
		            break;
		        }
		    }
		    if (varname === '') {
		    	throw new Error('Chart info varname not found, id = ' + eid);
		    }
		    if (varname === 'alb') {
		    	return true; // alb is always displayed, doesn't have an option to turn forcing off for
		    }

		    // work out which index of FORCINGS_VARNAMES is equivalent to varname
		    var fnum = -1;
		    for (var i = 0; i < FORCINGS_VARNAMES.length; i++) {
		    	if (FORCINGS_VARNAMES[i] === varname) {
		    		fnum = i;
		    		break;
		    	}
		    }
		    if (fnum === -1) {
		    	throw new Error('Forcing index/fnum with varname = ' + varname + ' not found.');
		    }
		    return $scope.forcings[$scope.getForcingVar(fnum)];
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

			var yAxisTitle;
			if (input)
				yAxisTitle = INPUT_AXIS_LABELS[chartInfo.varname];
			else // output chart
				yAxisTitle = OUTPUT_AXIS_LABELS[chartInfo.id];

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
				title: popupTitle,
				yAxisTitle: yAxisTitle,
				legend: chartInfo.legend // is undefined for all inputChartInfos and a few outputChartInfos
			};
			// open the popup, which will access the values set above
			var popup = window.open('./chart', '_blank', 'menubar=0,toolbar=0,status=0,titlebar=0,location=0,width=800,height=600');
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

		// changes currently active input chart to the given chart. updates visibility, etc
		$scope.selectInputChart = function(chart) {
			// set old chart to be invisible
			$scope.setChartVisible($scope.inputChartActive, false);
			// set new chart to be active input chart and make it visible
			$scope.inputChartActive = chart;
			$scope.setChartVisible(chart, true);
			// if the 'edit data' modal is open, also update the chart being displayed in that, and set mode to initial
		};

		// destroys output charts only
		$scope.destroyOutputCharts = function() {
			$scope.scenarioHasRun = false;
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

		// draws the input charts
		$scope.showInputCharts = function() {
			var setup;
			if ($scope.activeScenario.id >= CUSTOM_SCENARIO_ID_START) {
				setup = simulationSetupReducedCustom(customScenarioData[$scope.activeScenario.id]);
			} else {
				setup = simulationSetupReduced($scope.activeScenario.id);
				// also set the years range variable if it is a default scenario
				defaultScenarioYearsRange = Math.round(setup.years[0]) + ' - ' + Math.round(setup.years[setup.years.length - 1]);
			}

			// draw input charts and link plot data to the element for use by popup window setup later
			var co2Chart = plotData('chart-co2-emissions', setup.years, [ setup.emissions.CO2 ], false, INPUT_AXIS_LABELS.CO2);
			document.getElementById('chart-co2-emissions').plotInfo = { y: setup.years, data: [ setup.emissions.CO2 ] };
			var ch4Chart = plotData('chart-ch4-emissions', setup.years, [ setup.emissions.CH4 ], false, INPUT_AXIS_LABELS.CH4);
			document.getElementById('chart-ch4-emissions').plotInfo = { y: setup.years, data: [ setup.emissions.CH4 ] };
			var so2Chart = plotData('chart-so2-emissions', setup.years, [ setup.emissions.SO2 ], false, INPUT_AXIS_LABELS.SO2);
			document.getElementById('chart-so2-emissions').plotInfo = { y: setup.years, data: [ setup.emissions.SO2 ] };
			var albChart = plotData('chart-alb', setup.years, [ setup.alb ], false, INPUT_AXIS_LABELS.alb );
			document.getElementById('chart-alb').plotInfo = { y: setup.years, data: [ setup.alb ] };
			var solarChart = plotData('chart-solar-input', setup.years, [ setup.TSI ], false, INPUT_AXIS_LABELS.TSI);
			document.getElementById('chart-solar-input').plotInfo = { y: setup.years, data: [ setup.TSI ] };
			var volcChart = plotData('chart-volc-emissions', setup.years, [ setup.emissions.volc ], false, INPUT_AXIS_LABELS.volc);
			document.getElementById('chart-volc-emissions').plotInfo = { y: setup.years, data: [ setup.emissions.volc ] };

			$scope.inputCharts.push(co2Chart);
			// set input chart visible
			$scope.setChartVisible($scope.inputChartActive, true);
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
			// show input charts if active secnario isn't null
			if ($scope.activeScenario != null) {
				$scope.showInputCharts();
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

			$scope.showInputCharts();
		};

		// draws the input chart of the initial activeScenario upon page load (same code as lines above)
		// needs to be in timeout to let the page load first
		$timeout($scope.showInputCharts, 0);

		// runs the currently active scenario
		$scope.runScenario = function() {
			// if it's the default scenario that is being run
			$scope.chartsActive = true;

			var workerMessageObject = {
				// id at which custom scenarios begin
				customScenarioStart: CUSTOM_SCENARIO_ID_START,

				// scenario specific data
				id: $scope.activeScenario.id,
				consts: $scope.globalVariables,
				forcings: $scope.forcings,
				rcph: XLS_RCPH,
				rcphr: XLS_RCPH_ROWS,
				rcphc: XLS_RCPH_COLS,
				tline: TAU_LINE,
				tsi: XLS_TSI
			};
			if ($scope.activeScenario.id >= CUSTOM_SCENARIO_ID_START) {
				// if custom scenario, set custom data
				workerMessageObject.customData = customScenarioData[$scope.activeScenario.id];
			}
			// actually pass through the message
			worker.postMessage(workerMessageObject);

			// set to update page on recept of message from worker
			worker.onmessage = function(e) {
				if (e.data.type === 'update') {
					// update message - update progress bar
					var percent = e.data.percent;
					document.getElementById('simulation-progress-bar').style.width = percent + '%';
				} else if (e.data.type === 'print') {
					console.log('Message from webworker:\n' + e.data.message);
				} else if (e.data.type === 'finish') {
					$scope.scenarioHasRun = true;
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
							var cid = retData[i].id;
							var newChart = plotData(cid, retYears, retData[i].data, false, OUTPUT_AXIS_LABELS[cid]);
							$scope.outputCharts.push(newChart);
							// link plot data to the element for use by popup window setup later
							document.getElementById(cid).plotInfo = { y: retYears, data: retData[i].data };
							// make the output chart div visible
							$scope.setChartVisible($scope.outputChartActive, true);
						}
					}, 400);
				} else if (e.data.type === 'error') {
					console.log('Web-worker indicating error...');
					throw new Error(e.data.error);
				} else {
					throw new Error('Invalid message type received from worker: ' + e.data.type);
				}
			};
		};

		// checks that all inputs exist, if not, sets to zero
		// also forces all data array lengths to be the same length as years
		var adjustImportedData = function(customScenarioId) {
			var data = customScenarioData[customScenarioId];

			// interpolate years
			var firstYear = data.years[0];
			var lastYear = data.years[data.years.length - 1];
			var beforeInterpYears = data.years;
			data.years = interpC(firstYear, DT, lastYear);

			// create missing inputs
			var yearsLength = data.years.length;
			if (!data.emissions.CH4) data.emissions.CH4 = createAndFillArray(yearsLength, 0);
			if (!data.emissions.CO2) data.emissions.CO2 = createAndFillArray(yearsLength, 0);
			if (!data.emissions.SO2) data.emissions.SO2 = createAndFillArray(yearsLength, 0);
			if (!data.emissions.volc) data.emissions.volc = createAndFillArray(yearsLength, 0);
			if (!data.TSI) data.TSI = createAndFillArray(yearsLength, DEFAULT_TSI_VALUE);
			if (!data.mTSI) data.mTSI = nanmean(data.TSI);
			if (!data.alb) data.alb = createAndFillArray(yearsLength, DEFAULT_ALB_VALUE);

			var checkLengthFunc = function(array) {
				if (typeof array === 'undefined')
					return;

				if (data.years.length !== array.length) {
					if (data.years.length > array.length) {
						// interpolate
						array = interp1(beforeInterpYears, array, data.years);
					} else {
						array = reducePoints(array, data.years.length);
					}
				}
				return array;
			};

			data.emissions.CH4 = checkLengthFunc(data.emissions.CH4);
			data.emissions.CO2 = checkLengthFunc(data.emissions.CO2);
			data.emissions.SO2 = checkLengthFunc(data.emissions.SO2);
			data.emissions.volc = checkLengthFunc(data.emissions.volc);
			data.TSI = checkLengthFunc(data.TSI);
			data.alb = checkLengthFunc(data.alb);
		};

		// creates a new scenario
		$scope.createScenario = function() {
			if ($scope.scenarios === customScenarios) { // check that we do have the custom scenarios active right now
				$timeout(function() { // use timeout to let modal close first
					// add to list of scenarios
					$scope.scenarios.push({
						id: nextCustomScenarioId,
						name: $scope.createScenarioName,
						isdefault: false,
					});

					$scope.importScenario.id = nextCustomScenarioId;
					customScenarioData[nextCustomScenarioId] = $scope.importScenario;
					adjustImportedData(nextCustomScenarioId);

					// change to the newly created scenario
					$scope.selectScenario(nextCustomScenarioId);

					// increment next custom scenario id counter
					nextCustomScenarioId++;
				}, 0);
			}
		};

		$scope.importScenarioButtonEnabled = function() {
			// required for based and non-based custom scenarios
			if ($scope.createScenarioName == '' || $scope.scenarioNameTaken()) {
				return false;
			}
			if (!$scope.importScenario.years) {
				return false;
			}
			// success
			return true;
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
			// clear input charts
			$scope.destroyCharts();
			// pass active status to another custom scenario (if there are any left), and update $scope.activeScenario
			if ($scope.scenarios.length > 0) { // if there are still scenarios remaining
				if (index == $scope.scenarios.length) { // if it was the last item, we move index up by one. otherwise remains the same
					index--;
				}
				$scope.activeScenario = $scope.scenarios[index];
				$scope.activeScenario.active = true;
				// show input charts for the newly selected scenario
				$scope.showInputCharts();
			} else {
				$scope.activeScenario = null; // set active scenario to null
			}
		};

		// returns a string displaying the range of years in the current scenario
		$scope.getYearsRange = function() {
			if ($scope.activeScenario === null) {
				// no current scenario, return blank string
				return '';
			}
			var startYear;
			var endYear;
			if ($scope.standardActive === 'active') {
				return defaultScenarioYearsRange;
			} else {
				// advanced mode, ie. $scope.advancedActive === 'active'
				var yearsArray = customScenarioData[$scope.activeScenario.id].years;
				startYear = yearsArray[0];
				endYear = yearsArray[yearsArray.length - 1];
			}
			return Math.round(startYear) + ' - ' + Math.round(endYear);
		};

		// fetches the brief description of the scenario with the given id
		// the 'brief description' is just the first 100 characters of the description
		$scope.getBriefDescription = function(sid) {
			var text = $scope.descriptions[sid] || '';
			if (text.length > DESCRIPTION_CUTOFF_LIMIT) {
				return text.substring(0, DESCRIPTION_CUTOFF_LIMIT) + '...';
			}
			return text;
		};

		$scope.isSidebarActive = function(active) {
			return active ? 'active' : '';
		};

		// checks if the currently entered name in the new scenario form has already been taken
		$scope.scenarioNameTaken = function() {
			var nameTaken = false;
			for (var i = 0; i < $scope.defaultScenarios.length; i++) {
				if ($scope.defaultScenarios[i].name.toLowerCase() === $scope.createScenarioName.toLowerCase()) {
					nameTaken = true;
					break;
				}
			}
			if (!nameTaken) {
				for (var i = 0; i < $scope.scenarios.length; i++) {
					if ($scope.scenarios[i].name.toLowerCase() === $scope.createScenarioName.toLowerCase()) {
						nameTaken = true;
						break;
					}
				}
			}
			return nameTaken;
		};

		// importing and exporting

		$scope.importScenarioData = function(evt) {
			// parse csv
			var file = evt.target.files[0];

			Papa.parse(file, {

				header: false,
				dynamicTyping: true,
				skipEmptyLines: true,

				complete: function(results) {
					try {
						if (results.errors.length > 0) throw Error(result.errors[0].message);
						//console.log(results.data);

						var rows = results.data;
						$scope.importScenario = {
							emissions: {}
						};
						for (var i = 0; i < rows.length; i++) {
							var name = rows[i][0].toLowerCase().trim();
							rows[i].shift(); // remove the first element in the row, after reading it

							if (name === 'ch4' || name === 'co2' || name === 'so2' || name === 'volc') {
								if (name !== 'volc') name = name.toUpperCase();

								$scope.importScenario.emissions[name] = rows[i];
							} else {
								if (name === 'tsi') name = 'TSI';
								else if (name === 'mtsi') name = 'mTSI';
								$scope.importScenario[name] = rows[i];
							}
						}

						$timeout(function() {
							$('#import-scenario-modal').modal('show');
						}, 0);

					} catch (err) {
						var alertMessage = 'There was an error parsing the CSV input file. Please check that it is valid.\n' +
							'Error message:\n"' + err.toString() + '"';
						alert(alertMessage);
					}
				}
			});
		};

		$scope.closeImportScenarioModal = function() {
			$('#import-scenario-modal').modal('hide');
		};

		$scope.exportScenarioData = function() {
			var scenarioId = $scope.activeScenario.id;
			var setupData;

			if (scenarioId >= CUSTOM_SCENARIO_ID_START) {
				// custom scenario
				setupData = {
					emissions: {}
				};
				var custom = customScenarioData[scenarioId];
				setupData.years = reducePoints(custom.years);
				setupData.emissions.CH4 = reducePoints(custom.emissions.CH4);
				setupData.emissions.SO2 = reducePoints(custom.emissions.SO2);
				setupData.emissions.CO2 = reducePoints(custom.emissions.CO2);
				setupData.emissions.volc = reducePoints(custom.emissions.volc);
				setupData.TSI = reducePoints(custom.TSI);
				setupData.mTSI = custom.mTSI;
				setupData.alb = reducePoints(custom.alb);
			} else {
				// default scenario
				setupData = getUninterpolatedSimsetup(scenarioId);
			}

			var lines = [];

			lines.push('years,' + setupData.years.toString());
			lines.push('CH4,' + setupData.emissions.CH4.toString());
			lines.push('CO2,' + setupData.emissions.CO2.toString());
			lines.push('SO2,' + setupData.emissions.SO2.toString());
			lines.push('volc,' + setupData.emissions.volc.toString());
			lines.push('TSI,' + setupData.TSI.toString());
			lines.push('mTSI,' + setupData.mTSI);
			lines.push('alb,' + setupData.alb.toString());

			downloadAsCsv(lines);
		};

		// add listener for import buttons
		var csvLoader = document.getElementById('csvLoaderSidebar');
		csvLoader.addEventListener('change', $scope.importScenarioData, false);
		csvLoader.onclick = function() {
			// so we can select the same file again and still get a popup
			this.value = null;
		};

	}]);

// page has fully loaded
angular.element(document).ready(function() {
	// plot the empty input chart
	plotEmptyChart('chart-empty');
	// plot the base input chart, which will never be visible, but is necessary to keep the panel size constant
	plotEmptyChart('base-chart-never-shown');
});

// on change of input fields in edit globals modal, enable save and restore buttons
var enableDefaultAndSaveButtons = function() {
	document.getElementById('edit-globals-save').disabled = false;
	document.getElementById('edit-globals-restore-defaults').disabled = false;
};
