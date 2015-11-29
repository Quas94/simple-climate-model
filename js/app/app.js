/**
 * Main application source file
 *
 * @TODOs:
 *   -- figure out how the Matlab function 'interp1' works
 * - investigate: aragonite_saturation not used in the plotting?
 * - randn (line ~172)
 */

// the scenario to run
var scenarioId = 4;
// name of the scenario
var scenario;

// doesn't seem to be used until it is randomised farther down
// var col;

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
	for (var i = firstYear; i < lastYear; i++) {
		// the following code must be updated if the DT denominator is changed to be less than 1
		for (var j = 0; j < DT_DENOMINATOR; j++) {
			years.push(i + (j * DT));
			// console.log('pushed ' + years[years.length - 1]);
		}
	}
	years.push(lastYear); // lastYear can't be included in above for loop because of inner +DT nested loop

	if (scenarioId == 13) {
		// @TODO special case for scenario 13
		// years=rcp_hist_RF_CO2e(1,1):DT:2200
	}

	for (var i = 0; i < XLS_RCPH_ROWS; i++) {
		rcphi[i] = interp1(XLS_RCPH[0], XLS_RCPH[i], years);
		/*
		// debug display for interpolated values
		console.log("interpolated row number " + i + ", it has " + XLS_RCPH_I[i].length + " elements now");
		var logstring = '';
		for (var a = 0; a < XLS_RCPH_I[i].length; a++) {
			logstring += XLS_RCPH_I[i][a] + ' ';
		}
		console.log(logstring);
		*/
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

// initialise albedo array @TODO figure out the value of 'years'
for (var i = 0; i < years.length; i++) {
	alb[i] = alb0;
}

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
		// @TODO
		break;
	case 3:
		scenario = 'RCP3';
		// @TODO
		break;
	case 4:
		scenario = 'RCP85';
		emissions.CH4 = rcphi[57];
		emissions.CO2 = rcphi[56];
		emissions.SO2 = rcphi[63];
		// @TODO: solar increase / albedo increase needed? commented outlines in matlab code
		break;
	case 5:
	case 6:
	case 7:
	case 8:
	case 9:
		// @TODO special cases
		break;
	default:
		// @TODO remainder of cases
}

// more variables, some are arrays, presumably for plotting
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

// actual stepping through of the simulation
// @TODO determine how 'years' array is set (same as line 55)
// @TODO determine whether to use y or years[y] in calculations
for (var y = 1; y < years.length; y++) {
	// carbon cycle
	// ocean from glotter
	var a = Cup[y - 1] / Alk;
	var oma = 1 - a; // 1 minus 'a'
	var om2a = 1 - (2 * a); // 1 minus 2 times 'a'
	var H = (-k1 * oma + sqrt(square(k1) * square(oma) - 4 * k1 * k2 * om2a)) / 2; // hydrogen concentration
	pH[y] = -log10(H);
	var B = 1 / (1 + (k1 / H) + (k1 * k2 / square(H))); // ratio of dissolved CO2 to total oceanic carbon (B=B(pH))

	// terrestrial from Svirezhev
	P[y] = P[0] * (1 + a2 * (Cat[y - 1] - Cat[0])); // NPP with fertilisation effects
	So[y] = So[y - 1] + F1 * DT * (e * m * N[y - 1] - dr0 * So[y - 1]); // soil carbon
	N[y] = N[y - 1] + F1 * DT * (P[y - 1] - m * N[y - 1]); // vegetation carbon

	// aragonite saturation - not used?
	var h1 = pow(10, -pH[y]);
	var s = (2400e-6) / (1.2023e-6 / h1);
	var co3 = s * (1 + 1.2023e-6 / h1) / (1 + h1 / 8.0206e-10);
	aragonite_saturation[y] = 1e-2 * co3 / Ksp;

	// carbon budget
//console.log('emissions.CO2[y - 1] = ' + emissions.CO2[y - 1] + '. (y-1=' + (y-1) + ')');
	Cat[y] = Cat[y - 1] + (F1 * DT * emissions.CO2[y - 1]) + (F1 * DT * (-ka * Cat[y - 1] - A * B * Cup[y - 1]))
			 + (F1 * DT * (-P[y - 1] + (1 - e) * m * N[y - 1] + dr0 * So[y - 1])); // svirezhev
	Cup[y] = Cup[y - 1] + F1 * DT * ka * (Cat[y - 1] - A * B * Cup[y - 1]) - kd * (Cup[y - 1] - Clo[y - 1] / d);
	Clo[y] = Clo[y - 1] + F1 * DT *	kd * (Cup[y - 1] - Clo[y - 1] / d);

	// convert CO2 emissions to RF
	C_CO2[y] = Cat[y] / 2.13;
	R_CO2[y] = 5.35 * log(C_CO2[y] / C_CO2pi);
	if (isNaN(R_CO2[y])) R_CO2[y] = 0;
//console.log('R_CO2[' + y + '] = ' + R_CO2[y] + ', C_CO2[y]=' + C_CO2[y] + ',C_CO2pi=' + C_CO2pi +
//	', divided=' + (C_CO2[y] / C_CO2pi) + ', log=' + log(C_CO2[y] / C_CO2pi));

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

	// temperature model
//console.log(R_CO2[y - 1] + ', ' + R_CH4[y - 1]);
	var RF_GG = F1 * R_CO2[y - 1] + F2 * R_CH4[y - 1];
	RF_[y] = RF_GG + F3 * R_SO2[y - 1] + F4 * R_volc[y - 1] + F5 * R_sol[y];
//console.log(RF_GG + ', ' + R_SO2[y - 1] + ', ' + R_volc[y - 1] + ', ' + R_sol[y] + '(y = ' + y + ')');
	Ts[y] = Ts[y - 1] + DT * (RF_[y - 1] - L * Ts[y - 1] - g * (Ts[y - 1] - To[y - 1])) / Cs;
	To[y] = To[y - 1] + DT * (g * (Ts[y - 1] - To[y - 1])) / Co;
//console.log(Ts[y] + ', ' + F6 + ', ' + deltaT[y] + '(y = ' + y + ')');
if (isNaN(Ts[y]) || isNaN(F6) || isNaN(deltaT[y])) throw new Error('there was a NaN');
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

// actual plotting

// bounds of x-axis plotting
var xl = [ years[0], years[years.length - 1] ];

// plot surface temperature
// create data object
var surfTempData = {
	labels: [],
	series: [ [] ] // 2d array
};
// set labels
var str = '';
for (var i = 0; i < years.length; i++) {
	surfTempData.labels[i] = round(years[i], 2);
	surfTempData.series[0][i] = Tsurf[i];
	str += Tsurf[i] + ' ';
}
console.log(str);

// actually show graph
new Chartist.Line('#surface-temperature', surfTempData);
