/**
 * Contains setup function that fetches inputs for the default scenarios.
 */

/**
 * Takes in one parameter, the scenario id. The majority of the body of this function
 * previously resided in simulate.js' main simulate() function, but was extracted in
 * order to be able to display (and modify) inputs before running the simulation.
 *
 * Returns an object with relevant input variables and datasets.
 */
var simulationSetup = function(scenarioId) {
	// DT and alb0 undefined upon page load, initialise to default values
	if (typeof(DT) === 'undefined' && typeof(alb0) === 'undefined') {
		DT = DEFAULT_SIM_CONSTS.DT;
		alb0 = DEFAULT_SIM_CONSTS.alb0;
	}

	// name of the scenario
	var scenario;

	// emission values
	var emissions = {
		CH4: null,
		CO2: null,
		SO2: null,
		volc: null,
	};
	// TSI
	var TSI = [ 0 ];
	// set to nanmean(TSI) - mean of all non-Nan elements inside TSI
	var mTSI = 0;
	// albedo
	var alb = [];

	// years for simulation
	var years = [];

	// interpolated values of XLS_RCPH
	var rcphi = [];

	// setup common forcings for scenarios 1-4 and 10-17 inclusive (IPCC scenarios)
	if (scenarioId <= 4 || scenarioId >= 10) {
		var firstYear = XLS_RCPH[0][0];
		var lastYear = XLS_RCPH[0][XLS_RCPH_COLS - 1];
		years = interpC(firstYear, DT, lastYear); // equivalent to firstYear:DT:lastYear in Matlab syntax

		if (scenarioId == 13) {
			// @TODO special case for scenario 13
			// years=rcp_hist_RF_CO2e(1,1):DT:2200
		}

		for (var i = 0; i < XLS_RCPH_ROWS; i++) {
			rcphi[i] = interp1(XLS_RCPH[0], XLS_RCPH[i], years);
		}

		// @TODO volcanic and solar stuff
		// VOLCANIC
		// load 'tau.line_2012.12.txt'
		// set var OT = interp1(col1, col2, years)
		// if (isnan(OT)) OT = 0
		// set var emissions.volc = central_diff(OT, years) + (OT / vtau);
		// ^^^ central_diff is second-order differential eqn!!!
		// emissions.volc = (emissions.volc < 0) ? 0 : emissions.volc; // set to 0 if negative

		// Volcanic stuff precalculated by Matlab and plugged into TAU_LINE constant (defined in data.js)
		// may need to be altered in the future depending on specifics of custom data input
		emissions.volc = TAU_LINE;

		// SOLAR
		// load 'TSI_WLS_ann_1610_2008.xls'
		TSI = interp1(XLS_TSI[0], XLS_TSI[2], years);
		// mTSI is equal to the mean of all the non-NaN elements of TSI
		mTSI = nanmean(TSI);
		// if TSI has NaN elements, set those to equal mTSI
		for (var i = 0; i < TSI.length; i++) {
			if (isNaN(TSI[i])) {
				TSI[i] = mTSI;
			}
		}
	}

	// flag for whether or not albedo has already been initialised in switch handler
	// if this flag is set, the default albedo setter at the bottom (just below the switch statement) won't be executed
	var albSet = false;

	switch (scenarioId) {
		// scenarios dealing with extracting information from 'rcp_hist_RF_CO2e.xls'
		case 1:
			scenario = 'RCP6';
			emissions.CH4 = rcphi[48];
			emissions.CO2 = rcphi[47];
			emissions.SO2 = rcphi[60];
			// set all elements in TSI equal to the first one
			for (var i = 1; i < TSI.length; i++) {
				TSI[i] = TSI[0];
			}
			break;
		case 2:
			scenario = 'RCP45';
			emissions.CH4 = rcphi[51];
			emissions.CO2 = rcphi[50];
			emissions.SO2 = rcphi[61];
			break;
		case 3:
			scenario = 'RCP3';
			emissions.CH4 = rcphi[54];
			emissions.CO2 = rcphi[53];
			emissions.SO2 = rcphi[62];
			break;
		case 4:
			scenario = 'RCP85';
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];
			break;
		case 5:
			// create synthetic time series
			scenario = 'Synthetic Emissions';
			// @TODO - needs central_diff
			break;
		case 6:
			// create synthetic time series
			scenario = 'Volcanic Eruption - Pinatubo';
			// @TODO - needs central_diff
			break;
		case 7:
			// create synthetic time series
			scenario = 'CO2 Pulse';
			/*
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 0; // solar
			F6 = 0; // internal variability
			*/

			years = interpC(0, DT, 2000); // equivalent to Matlab syntax of years = 0:DT:2000

			var numYears = years.length;
			var ts = interpC(1, 1, numYears); // 1:length(years)
			for (var i = 0; i < ts.length; i++) {
				ts[i] /= numYears; // ts = (1:length(years)) / length(years)
			}

			emissions.CH4 = ts; // @TODO check with alex about the *0 in these 4 lines from matlab code
			emissions.CO2 = arrcpy(ts); // call arrcpy for deep copy because this will be modified
			emissions.SO2 = ts;
			emissions.volc = ts;

			// emissionCO2(1/DT*5:1/DT*15)=20;
			// there will be an offset of 1 month here due to index start diff (js=0 and matlab=1) but shouldn't really matter
			for (var i = (1 / DT * 5); i <= (1 / DT * 15); i++) {
				emissions.CO2[i] = 20;
			}

			// solar irradiance
			mTSI = 1365;
			// TSIcycle=cos(years/11*2*pi)/4; TSI=mTSI+TSIcycle;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI + (cos(years[i] / 11 * 2 * Math.PI) / 4);
			}
		    break;

		case 8:
			// create synthetic time series
			scenario = 'CH4 Pulse';
			/*
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 0; // solar
			F6 = 0; // internal variability
			*/

			years = interpC(0, DT, 500); // equivalent to Matlab syntax of years = 0:DT:2000

			var numYears = years.length;
			var ts = interpC(1, 1, numYears); // 1:length(years)
			for (var i = 0; i < ts.length; i++) {
				ts[i] /= numYears; // ts = (1:length(years)) / length(years)
			}

			emissions.CH4 = arrcpy(ts); // call arrcpy for deep copy because this will be modified
			emissions.CO2 = ts;
			emissions.SO2 = ts;
			emissions.volc = ts;

			// emissionCH4(1/DT*5:1/DT*15)=1000;
			for (var i = (1 / DT * 5); i <= (1 / DT * 15); i++) {
				emissions.CH4[i] = 1000;
			}

			// solar irradiance
			mTSI = 1365;
			// TSIcycle=cos(years/11*2*pi)/4; TSI=mTSI+TSIcycle;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI + (cos(years[i] / 11 * 2 * Math.PI) / 4);
			}

			break;

		case 9:
			// create synthetic time series
			scenario = 'Albedo Increase';
			/*
			F1 = 0;
			F2 = 0;
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 1; // solar
			F6 = 0; // internal variability
			*/
			years = interpC(0, DT, 2000);

			// ts=(1:length(years))/length(years);
			var numYears = years.length;
			var ts = interpC(1, 1, numYears); // 1:length(years)
			for (var i = 0; i < ts.length; i++) {
				ts[i] /= numYears; // ts = (1:length(years)) / length(years)
			}

			emissions.CH4 = ts;
			emissions.CO2 = ts;
			emissions.SO2 = ts;
			emissions.volc = ts;

			// solar irradiance
			mTSI = 1365;
			// TSIcycle=cos(years/11*2*pi)/4; TSI=mTSI+TSIcycle;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI + (cos(years[i] / 11 * 2 * Math.PI) / 4);
			}

			// albedo
			albSet = true; // mark the albedo as already set so the default initialisation chunk below won't overwrite
			for (var i = 1; i <= numYears; i++) {
				alb[i - 1] = alb0 + 0.1; // alb(1:length(years))=alb0+0.1;
			}
			for (var i = 1; i <= (1 / DT); i++) {
				alb[i - 1] = alb0 + i / (1 / DT) / 10; // alb(1:1/DT*1)=alb0+(1:1/DT*1)/(1/DT*1)/10;
			}
			// alb(1/DT*1000+1:1/DT*1001)=alb0+0.1-(1:1/DT*1)/(1/DT*1)/10;
			var j = 1;
			for (var i = 1 / DT * 1000 + 1; i <= 1 / DT * 1001; i++) {
				alb[i - 1] = alb0 + 0.1 - j / (1 / DT) / 10;
				j++;
			}
			// alb(1/DT*1001:end)=alb0;
			for (var i = (1 / DT * 1001); i <= numYears; i++) {
				alb[i - 1] = alb0;
			}
			break;

		case 10:
		case 11:
			scenario = 'RCP85 + Geoengineering (i)';

			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = arrcpy(rcphi[63]); // modified below

			var ind = arrfind(years, 2015);
			var Ni = years.length - ind;
			var j = 1;
			for (var i = ind; i < years.length; i++, j++) {
				emissions.SO2[i] = emissions.SO2[ind] + j / Ni * 1000;
			}

			if (scenarioId == 10) { // this is where scenario 10 finishes, scenario 11 goes on
				break;
			}

			// scenario 11 continues on
			scenario = 'RCP85 + Geoengineering (ii)';

			ind = arrfind(years, 2070);
			for (var i = ind; i < years.length; i++) {
				emissions.SO2[i] = 0;
			}

			break;

		case 12:
			scenario = 'Arctic Ice Loss';

			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];

			var areaIce = 7e6;
			var areaEarth = 4 * Math.PI * square(6400);
			var arcticAlbedoChange = (0.9 - 0.1) / 2; // factor of 2 because it only takes effect in the summer
			var planetAlbedoChange = arcticAlbedoChange * areaIce / (areaIce + areaEarth);

			// set albedo
			albSet = true;
			for (var i = 0; i < years.length; i++) {
				alb[i] = alb0;
			}
			var ind1 = arrfind(years, 1980);
			var ind2 = arrfind(years, 2050);
			var j = 1;
			for (var i = ind1; i < ind2; i++, j++) {
				alb[i] = alb0 - j / (ind2 - ind1 + 1) * planetAlbedoChange;
			}
			for (var i = ind2; i < years.length; i++) {
				alb[i] = alb[ind2 - 1];
			}
			break;

		case 13:
			scenario = 'Forcing switched off at 2020';
			emissions.CH4 = arrcpy(rcphi[57]); // modified below
			emissions.CO2 = arrcpy(rcphi[56]); // modified below
			emissions.SO2 = arrcpy(rcphi[63]); // modified below

			var ind = arrfind(years, 2020);
			// all indices from 'ind' onwards, set to 0
			for (var i = ind; i < years.length; i++) {
				emissions.CH4[i] = 0;
				emissions.CO2[i] = 0;
				emissions.SO2[i] = 0;
			}
			break;

		case 14:
			scenario = 'High Aerosol Emissions from 2020';
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = arrcpy(rcphi[63]); // so2 will be modified below

			var ind = arrfind(years, 2020);
			// for SO2, all indices from 'ind' onwards, set to 1000
			for (var i = ind; i < years.length; i++) {
				emissions.SO2[i] = 1000;
			}
			break;

		case 15:
			scenario = 'Albedo increased from 0.3 to 0.32 at 2020';
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];

			var ind = arrfind(years, 2020);
			// set albedo increase
			albSet = true;
			for (var i = 0; i < ind; i++) {
				alb[i] = alb0;
			}
			for (var i = ind; i < years.length; i++) {
				alb[i] = 0.32;
			}
			break;

		case 16:
			scenario = 'Changes in TSI';
			emissions.CH4 = years;
			emissions.CO2 = years;
			emissions.SO2 = years;
			emissions.volc = years;
			mTSI = 1365;
			for (var i = 0; i < TSI.length; i++) {
				TSI[i] = mTSI;
			}
			var indStart = arrfind(years, 1900);
			var indEnd = arrfind(years, 1910);
			for (var i = indStart; i < indEnd; i++) {
				TSI[i] = mTSI - 10;
			}
			indStart = arrfind(years, 2000);
			indEnd = arrfind(years, 2010);
			for (var i = indStart; i < indEnd; i++) {
				TSI[i] = mTSI + 20;
			}
			break;

		case 17:
			scenario = 'Volcanic Eruption';
			emissions.CH4 = years;
			emissions.CO2 = years;
			emissions.SO2 = years;
			emissions.volc = arrcpy(years); // since volc will be modified down below
			var indStart = arrfind(years, 2000);
			var indEnd = arrfind(years, 2002);
			for (var i = indStart; i < indEnd; i++) {
				emissions.volc[i] = 0.5;
			}
			mTSI = 1365;
			for (var i = 0; i < TSI.length; i++) {
				TSI[i] = mTSI;
			}
			break;

		default:
			throw new Error('Unsupported scenario ID: ' + scenarioId);
	}

	// initialise albedo array - do after switch scenarios because some of them modify the years array greatly
	if (!albSet) { // scenario 9 will have set this flag to true
		for (var i = 0; i < years.length; i++) {
			alb[i] = alb0;
		}
	}

	// return relevant information
	var ret = {
		scenario: scenario,
		emissions: emissions,
		TSI: TSI,
		mTSI: mTSI,
		alb: alb,
		years: years,
		rcphi: rcphi
	};
	return ret;
}

/**
 * Used in place of a direct simulationSetup() call from within app.mainCtrl.$scope.selectScenario().
 *
 * Reduces years and emissions with the reducePoints() function.
 */
var simulationSetupReduced = function(scenarioId) {
	var setup = simulationSetup(scenarioId);
	// reducePoints() returns a new array, no need to worry about modifying original data
	setup.emissions.CH4 = reducePoints(setup.emissions.CH4);
	setup.emissions.CO2 = reducePoints(setup.emissions.CO2);
	setup.emissions.SO2 = reducePoints(setup.emissions.SO2);
	setup.emissions.volc = reducePoints(setup.emissions.volc);
	setup.years = reducePoints(setup.years);
	return setup;
};
