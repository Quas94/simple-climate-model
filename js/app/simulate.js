/**
 * Source that contains the main simulation function, to be used with a web worker.
 *
 * - investigate: aragonite_saturation not used in the plotting?
 * - implement a better version of randn
 */

/**
 * Variables in this scope which are set by onmessage() - see below near the bottom.
 */
var scenarioId;

/**
 * Sends an update function containing the progress percentage to update to
 */
var updateProgress = function(p) {
	postMessage({
		type: 'update',
		percent: p
	});
};

/**
 * Takes in the scenario ID, runs the model simulation and draws the resulting graphs.
 *
 * Returns references to the created Chartist charts.
 */
var simulate = function() {

	// ------------------------------------ BEGINNING OF MODEL ------------------------------------ \\

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

	// flag for whether or not albedo has already been initialised in switch handler below
	// (only scenario 9 will set this flag)
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
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 0; // solar
			F6 = 0; // internal variability

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
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 0; // solar
			F6 = 0; // internal variability

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
			F1 = 0;
			F2 = 0;
			F3 = 0; // SO2
			F4 = 0; // volcanics
			F5 = 1; // solar
			F6 = 0; // internal variability
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

			// albedo - @TODO needs fixing, doesn't work quite right
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
			var arcticAlbedoChange = (0.9 - 0.1) / 2; // factor of 2 because it only has effect in the summer
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

	// Ocean (Glotter)
	var Cat = [ 596 ];
	var Cup = [ 713 ];
	var Clo = [ Cup[0] * d ];
	// Terrestrial (Svirezhev)
	var P = [ 60 ]; // Gt/yr; NPP P=P(CO2,T,N); here we assume that P only changes due to CO2 fertilisation
	var N = [ 689.6552 ]; // original value 700; %Gt; Carbon in vegetation
	var So = [ 1218.3 ]; // original value 1200; %Gt  Carbon in Soil
	// Temperature (Geoffroy)
	var Ts = [ 0 ];
	var To = [ 0 ];
	var deltaT = [ 0 ];
	var Tsurf = [ 0 ];
	var C_CO2 = [ Cat[0] / 2.13 ];
	var R_CO2 = [ 0 ];
	var C_CH4 = [ 0 ];
	var R_CH4 = [ 0 ];
	var R_SO2 = [ 0 ];
	var OpTkhkV = [ 0 ];
	var SL = [ 0 ];
	var C_CO2pi = Cat[0] / 2.13; // % PI concentration; NB glotter used 285 (but need this value for equilibrium)
	var C_CH4pi = 791; // PI concentration

	// aragonite saturation - appears to be calculated but not used
	var aragonite_saturation = [ 0 ];

	// for use with solar
	var R_sol = [ 0 ];
	// for use with temperature model
	var RF_ = [ 0 ];
	// for use with volcanic aerosols - same question as RF_
	var R_volc = [ 0 ];
	// ocean pH
	var pH = [ 0 ];

	// bulbs
	var bulbs_in_lw = [ 0 ];
	var bulbs_out_lw = [ 0 ]; // change in black body radiation
	var bulbs_in_sw = [ 0 ];
	var bulbs_out_sw = [ 0 ];

	// step through model simulation
	for (var y = 1; y < years.length; y++) {
		// carbon cycle
		// ocean from glotter
		var a = Cup[y - 1] / Alk;
		var H = (-k1 * (1 - a) + sqrt(square(k1) * square(1 - a) - 4 * k1 * k2 * (1 - 2 * a))) / 2; // hydrogen concentration
		pH[y] = -log10(H);
		var B = 1 / (1 + k1 / H + k1 * k2 / square(H)); // ratio of dissolved CO2 to total oceanic carbon (B=B(pH))

		// terrestrial from Svirezhev
		P[y] = P[0] * (1 + a2 * (Cat[y - 1] - Cat[0])); // NPP with fertilisation effects
		So[y] = So[y - 1] + F1 * DT * (e * m * N[y - 1] - dr0 * So[y - 1]); // soil carbon
		N[y] = N[y - 1] + F1 * DT * (P[y - 1] - m * N[y - 1]); // vegetation carbon

		// aragonite saturation - not used?
		var h1 = pow(10, -pH[y]);
		var s = 2400e-6 / (1.2023e-6 / h1);
		var co3 = s * (1 + 1.2023e-6 / h1) / (1 + h1 / 8.0206e-10);
		aragonite_saturation[y] = 1e-2 * co3 / Ksp;

		// carbon budget
		Cat[y] = Cat[y - 1] + F1 * DT * emissions.CO2[y - 1] + F1 * DT * (-ka * (Cat[y - 1] - A * B * Cup[y - 1]))
				 + F1 * DT * (-P[y - 1] + (1 - e) * m * N[y - 1] + dr0 * So[y - 1]); // svirezhev
		Cup[y] = Cup[y - 1] + F1 * DT * (ka * (Cat[y - 1] - A * B * Cup[y - 1]) - kd * (Cup[y - 1] - Clo[y - 1] / d));
		Clo[y] = Clo[y - 1] + F1 * DT *	(kd * (Cup[y - 1] - Clo[y - 1] / d));

		// convert CO2 emissions to RF
		C_CO2[y] = Cat[y] / 2.13;
		R_CO2[y] = 5.35 * log(C_CO2[y] / C_CO2pi);

		// convert CH4 emissions to RF
		var T = tau_ch4_pi * pow((C_CH4pi / (C_CH4[y - 1] + C_CH4pi)), alpha_ch4);
		C_CH4[y] = C_CH4[y - 1] + DT * (F2 * emissions.CH4[y - 1] / 2.78 - (1 / T) * C_CH4[y - 1]);
		R_CH4[y] = 0.66 * log((C_CH4pi + C_CH4[y]) / C_CH4pi);

		// anthropogenic aerosols
		R_SO2[y] = AF * (emissions.SO2[y - 1] - emissions.SO2[0]);

		// volcanic aerosols
		OpTkhkV[y] = OpTkhkV[y - 1] + DT * (emissions.volc[y] - OpTkhkV[y - 1] / vtau);
		R_volc[y] = VF * OpTkhkV[y];

		// internal variability
		deltaT[y] = iv_alpha * deltaT[y - 1] + iv_beta * randn();

		// solar
		R_sol[y] = ((TSI[y] - mTSI) / 4) * (1 - alb[y]) - TSI[y] / 4 * (alb[y] - alb0);
		if (isNaN(R_sol[y])) throw new Error('y = ' + y + ', TSI[y] = ' + TSI[y] + ', alb[y] = ' + alb[y] + ', alb0 = ' + alb0);

		// temperature model
		var RF_GG = F1 * R_CO2[y - 1] + F2 * R_CH4[y - 1];
		RF_[y] = RF_GG + F3 * R_SO2[y - 1] + F4 * R_volc[y - 1] + F5 * R_sol[y];
		Ts[y] = Ts[y - 1] + DT * (RF_[y - 1] - L * Ts[y - 1] - g * (Ts[y - 1] - To[y - 1])) / Cs;
		
		To[y] = To[y - 1] + DT * (g * (Ts[y - 1] - To[y - 1])) / Co;
		Tsurf[y] = Ts[y] + F6 * deltaT[y];

		// SL
		SL[y] = SL[y - 1] + DT * (si_a * (Ts[y] - si_To) + si_b * (Ts[y] - Ts[y - 1]) / DT);

		// radiative forcing to bulb conversion
		// L*Ts term includes changes in black body radiation as well as changes in LW due to feedbacks
		// 5.4*Ts is linearised stefan boltzman at 15oC

		// CO2, Methane and feedback terms (e.g. water vapour)
		bulbs_in_lw[y]  =  nobulbs * (F1 * R_CO2[y - 1] + F2 * R_CH4[y - 1] - L * Ts[y - 1] + 5.4 * Ts[y - 1]);
		// change in black body radiation
		bulbs_out_lw[y] = -nobulbs * (-5.4 * Ts[y - 1]);
		bulbs_in_sw[y]  =  nobulbs * ((TSI[y] - mTSI) / 4);
		bulbs_out_sw[y] = -nobulbs * (R_sol[y] - (TSI[y] - mTSI) / 4 + (F3 * R_SO2[y - 1] + F4 * R_volc[y - 1]));
	}

	// -------------------------------------- END OF MODEL -------------------------------------- \\

	// last bit of manipulation on co2 emissions
	var co2e = [];
	for (var i = 0; i < emissions.CO2.length; i++) {
		co2e[i] = emissions.CO2[i] * F1;
	}

	// model simulation complete, post message back to draw the charts
	var simulatedData = {
		type: 'finish',
		y: years,
		charts: [
			{
				id: 'base-chart-temperatures',
				data: [ Tsurf, To ]
			},
			{
				id: 'chart-co2-emissions',
				data: [ co2e ]
			},
			{
				id: 'base-chart-co2-concentration',
				data: [ C_CO2 ]
			},
		]
	};

	// @TODO: reduce number of data points in return data set to reduce plotting time

	// return and post message
	postMessage(simulatedData);

	/*

	// return array containing objects that have references to each of the charts that were drawn
	var ret = [];
	// main charts
	// surface and ocean temperatures
	ret.push(plotData2('base-chart-temperatures', years, Tsurf, To));
	// link plot data to the element for use by popup window setup later
	document.getElementById('base-chart-temperatures').plotInfo = { y: years, data: [ Tsurf, To ] };

	// secondary charts
	// CO2 emissions
	// multiply by F1
	ret.push(plotData('chart-co2-emissions', years, co2e));
	// link plot data to the element for use by popup window setup later
	document.getElementById('chart-co2-emissions').plotInfo = { y: years, data: [ co2e ] };
	// CO2 concentration
	ret.push(plotData('base-chart-co2-concentration', years, C_CO2));
	// link plot data to the element for use by popup window setup later
	document.getElementById('base-chart-co2-concentration').plotInfo = { y: years, data: [ C_CO2 ] };

	*/
};

onmessage = function(e) {
	// activate upon message which contains simulation consts and scenario id
	var data = e.data;
	// set scenarioId
	scenarioId = data.id;
	// for all elements inside sc, set it to this.element
	var keys = Object.keys(data.consts);
	for (var i = 0; i < keys.length; i++) {
		this[keys[i]] = data.consts[keys[i]];
	}
	// set data values
	this.XLS_RCPH = data.rcph;
	this.XLS_RCPH_ROWS = data.rcphr;
	this.XLS_RCPH_COLS = data.rcphc;
	this.TAU_LINE = data.tline;
	this.XLS_TSI = data.tsi;

	updateProgress(10);

	// import functions.js
	importScripts('functions.js');
	
	updateProgress(20);

	// wait half a second before running
	setTimeout(function() {
		simulate();
	}, 500);
};
