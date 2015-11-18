/**
 * Main application source file
 *
 * @TODOs:
 * - figure out how the Matlab function 'interp1' works
 * - figure out why 'clear OT* E*' requires the asterisks
 * - figure out what *0 after function call means (surely not multiply by zero?)
 *   eg: emissionCH4=rcp_hist_RF_CO2eI(51,:)*0; % line 165 of Matlab source
 */

// special config for scenarios 5-9 inclusive
if (scenario >= 5 && scenario <= 9) {
	// @TODO:
	// load 'rcp_hist_RF_CO2e.xls'
	// set var years = all values in the first row, in increments of 'DT' (1/12)

	// loop from 1 to length of first column (= number of rows...?)
	// for each row: if any cells in this row evaluate to false/zero
	// make this row = interp1(row1, rowCurrent, years)

	// VOLCANIC
	// load 'tau.line_2012.12.txt'
	// set var OT = interp1(col1, col2, years)
	// if (isnan(OT)) OT = 0
	// set var emission_volc = central_diff(OT, years) + (OT / vtau);
	// ^^^ central_diff is second-order differential eqn!!!
	// if (emission_volc < 0) emission_volc = 0;

	// SOLAR
	// load 'TSI_WLS_ann_1610_2008.xls'
	// TSI = interp1(col1, col3, years)
	// mTSI = nanmean(TSI) - mean of all non-NaN elements inside TSI
	// if TSI has NaN elements, set it to equal mTSI
}


