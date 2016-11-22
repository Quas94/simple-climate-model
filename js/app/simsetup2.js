/**
 * For exporting, so no interpolation.
 */
var getUninterpolatedSimsetup = function(scenarioId) {
	if (typeof(alb0) === 'undefined') {
		alb0 = DEFAULT_SIM_CONSTS.alb0;
	}
	// make sure scenarioId is of type Number
	scenarioId = Number(scenarioId);

	var ONE_YEAR = 1;

	var firstYear = XLS_RCPH[0][0];
	var lastYear = XLS_RCPH[0][XLS_RCPH_COLS - 1];
	var years = interpC(firstYear, ONE_YEAR, lastYear);

	var rcphi = [];

	var emissions = {
		CH4: null,
		CO2: null,
		SO2: null,
		volc: null,
	};
	var TSI = [ 0 ];
	var mTSI = 0;

	var alb = [];

	if (scenarioId <= 4 || scenarioId >= 10) {
		emissions.volc = getDefaultVolc();
		TSI = getDefaultTSI(years);
		mTSI = nanmean(TSI);
		for (var i = 0; i < TSI.length; i++) {
			if (isNaN(TSI[i])) {
				TSI[i] = mTSI;
			}
		}
		
		for (var i = 0; i < XLS_RCPH_ROWS; i++) {
			rcphi[i] = interp1(XLS_RCPH[0], XLS_RCPH[i], years);
		}
	}

	switch (scenarioId) {
		case 1:
			emissions.CH4 = rcphi[54];
			emissions.CO2 = rcphi[53];
			emissions.SO2 = rcphi[62];
			break;
		case 2:
			emissions.CH4 = rcphi[51];
			emissions.CO2 = rcphi[50];
			emissions.SO2 = rcphi[61];
			break;
		case 3:
			emissions.CH4 = rcphi[48];
			emissions.CO2 = rcphi[47];
			emissions.SO2 = rcphi[60];
			break;
		case 4:
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];
			break;

		case 7:
			years = interpC(0, ONE_YEAR, 2000);
			var numYears = years.length;
			var ts = [];
			for (var i = 0; i < numYears; i++) {
				ts.push(0);
			}
			emissions.CH4 = arrcpy(ts);
			emissions.CO2 = arrcpy(ts);
			emissions.SO2 = arrcpy(ts);
			emissions.volc = arrcpy(ts);
			for (var i = (1 / ONE_YEAR * 5); i <= (1 / ONE_YEAR * 15); i++) {
				emissions.CO2[i] = 20;
			}
			// solar irradiance
			mTSI = 1365;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI;
			}
		    break;

		case 8:
			years = interpC(0, ONE_YEAR, 500);
			var numYears = years.length;
			var ts = [];
			for (var i = 0; i < numYears; i++) {
				ts.push(0);
			}
			emissions.CH4 = arrcpy(ts);
			emissions.CO2 = arrcpy(ts);
			emissions.SO2 = arrcpy(ts);
			emissions.volc = arrcpy(ts);
			for (var i = (1 / ONE_YEAR * 5); i <= (1 / ONE_YEAR * 15); i++) {
				emissions.CH4[i] = 1000;
			}
			mTSI = 1365;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI;
			}
			break;

		case 9:
			years = interpC(0, ONE_YEAR, 2000);
			var numYears = years.length;
			var ts = [];
			for (var i = 0; i < numYears; i++) {
				ts.push(0);
			}
			emissions.CH4 = arrcpy(ts);
			emissions.CO2 = arrcpy(ts);
			emissions.SO2 = arrcpy(ts);
			emissions.volc = arrcpy(ts);
			mTSI = 1365;
			for (var i = 0; i < numYears; i++) {
				TSI[i] = mTSI;
			}

			for (var i = 0; i < years.length; i++) {
				alb[i] = alb0;
			}
			for (var i = (100 / ONE_YEAR); i < (1000 / ONE_YEAR); i++) {
				alb[i] += 0.1;
			}
			break;

		case 10:
		case 11:
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];

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
			ind = arrfind(years, 2070);
			for (var i = ind; i < years.length; i++) {
				emissions.SO2[i] = 0;
			}
			break;

		case 13:
			emissions.CH4 = rcphi[57];
			emissions.CO2 = rcphi[56];
			emissions.SO2 = rcphi[63];

			var ind = arrfind(years, 2020);
			// all indices from 'ind' onwards, set to 0
			for (var i = ind; i < years.length; i++) {
				emissions.CH4[i] = 0;
				emissions.CO2[i] = 0;
				emissions.SO2[i] = 0;
			}
			break;

		case 16:
			var zeroes = [];
			for (var i = 0; i < years.length; i++) {
				zeroes.push(0);
			}
			emissions.CH4 = arrcpy(zeroes);
			emissions.CO2 = arrcpy(zeroes);
			emissions.SO2 = arrcpy(zeroes);
			emissions.volc = arrcpy(zeroes);
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
				TSI[i] = mTSI + 10;
			}
			break;

		case 17:
			var zeroes = [];
			for (var i = 0; i < years.length; i++) {
				zeroes.push(0);
			}
			emissions.CH4 = arrcpy(zeroes);
			emissions.CO2 = arrcpy(zeroes);
			emissions.SO2 = arrcpy(zeroes);
			emissions.volc = arrcpy(zeroes);
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

	if (alb.length === 0) {
		for (var i = 0; i < years.length; i++) {
			alb[i] = alb0;
		}
	}

	// return relevant information
	var ret = {
		emissions: emissions,
		TSI: TSI,
		mTSI: mTSI,
		alb: alb,
		years: years
	};
	return ret;
};
