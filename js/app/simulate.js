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
var progressPercentage;

/**
 * Sends a message to update the progress bar by 10% at a time.
 */
var updateProgress = function() {
	// increment percentage by 10
	progressPercentage += 10;
	// post the message to the ui thread
	postMessage({
		type: 'update',
		percent: progressPercentage
	});
};

/**
 * Reduces the number of points in a dataset. This greatly increases the responsiveness of the viewport thread (plotting over
 * 5,000 points on a Chartist chart lags the framerate).
 *
 * Reduction is done by only preserving every x-th value, where x denotes the number of original values divided by GOAL_POINTS.
 */
var reducePoints = function(original) {
	var GOAL_POINTS = 3000; // number of points in the result
	var result = []; // the array that will be returned
	var x = original.length / GOAL_POINTS;
	if (x < 2) {
		// just return original, no reductions required
		return original;
	}
	for (var i = 0; i < GOAL_POINTS; i++) {
		// set result[i] to the closest corresponding index in original
		result[i] = original[Math.round(i * x)];
	}
	return result;
};

/**
 * Runs the current scenario. All relevant inputs and data have been set to this object's fields
 * before calling this function.
 *
 * Returns references to the created Chartist charts via Worker postMessage.
 */
var simulate = function() {
	updateProgress();
	
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

	// finished selecting and setting up the given scenario and additional variables
	updateProgress();
	// calculate years per 10% of progress
	var updateEvery = Math.round(years.length / 10); // because 90% remaining

	// step through model simulation
	for (var y = 1; y < years.length; y++) {
		// update progress if applicable
		if (y % updateEvery == 0) {
			updateProgress();
		}

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
	// @TODO update this bit when dynamic chart update on forcing checkbox input change is being done
	var co2e = [];
	for (var i = 0; i < emissions.CO2.length; i++) {
		co2e[i] = emissions.CO2[i] * F1;
	}

	years = reducePoints(years);
	Tsurf = reducePoints(Tsurf);
	To = reducePoints(To);
	C_CO2 = reducePoints(C_CO2);
	// co2 irrelevant here, inputs are separate from the outputs

	// model simulation complete, post message back to draw the output charts
	var simulatedData = {
		type: 'finish',
		y: years,
		charts: [
			{
				id: 'base-chart-temperatures',
				data: [ Tsurf, To ]
			},
			{
				id: 'chart-co2-concentration',
				data: [ C_CO2 ]
			},
		]
	};

	// return and post message
	postMessage(simulatedData);
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
	// do the same as above for forcings
	var keys = Object.keys(data.forcings);
	for (var i = 0; i < keys.length; i++) {
		this[keys[i]] = data.forcings[keys[i]];
	}
	// set data values
	this.XLS_RCPH = data.rcph;
	this.XLS_RCPH_ROWS = data.rcphr;
	this.XLS_RCPH_COLS = data.rcphc;
	this.TAU_LINE = data.tline;
	this.XLS_TSI = data.tsi;
	// set progress percentage to zero
	progressPercentage = 0;

	// import functions.js
	importScripts('functions.js');

	// import simsetup.js
	importScripts('simsetup.js');

	var setup = simulationSetup(scenarioId);
	this.scenario = setup.scenario;
	this.emissions = setup.emissions;
	this.TSI = setup.TSI;
	this.mTSI = setup.mTSI;
	this.alb = setup.alb;
	this.years = setup.years;
	this.rcphi = setup.rcphi;

	// wait half a second before running
	setTimeout(function() {
		simulate();
	}, 500);
};
