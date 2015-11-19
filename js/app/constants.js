/**
 * Constants file
 *
 * @TODOs:
 * - check value of 'iv_alpha' - determine effect of caret operator ^ in Matlab
 * - 'scenario' is not a constant
 * - figure out octal or decimal trailings for the following 2 lines (lines 48/49)
 *   var kh = 1.0548e+03;  // at 15oC; ratio of the molar concentrations of CO2 in atmosphere and ocean (Henry's Law)
 *   var var k1 = 8.7184e-07;  // at 15oC; dissociation constant
 * - 'nobulbs' constant - use 1 or 1 * 100 / 60 * 50?
 */

// import Math functions
var pow = Math.pow;
var sqrt = Math.sqrt;
var log = Math.log;

// square function for cleaner calculations in the model code
var square = function(num) {
	return pow(num, 2);
};

// log 10 function, which some browsers (older browsers + all Internet Explorer versions) don't support
var log10 = Math.log10 || function(x) {
	return Math.log(x) / Math.LN10;
};

// time step (years)
var DT = 1 / 12; // needs to be small otherwise ocean chanistry calculations become unstable

// switches for forcing
var F1 = 1; //CO2
var F2 = 1; //CH4
var F3 = 1; //SO2
var F4 = 1; //Volcanics
var F5 = 1; //Solar
var F6 = 0; //Internal variability

//// Model ////////////////////////////////////////////////////////////////////////////////////////
// Temperature model from GEOFFROY et al.(2013); parameter values based on CMIP5 multi-model mean
// Carbon cycle model based on simplified Glotter (ocean) and Svirezhev (terrestrial)

// Constants for temperature model
var Cs = 9;       // *60*60*24*365; //W yr/m2/K (Geoffroy uses 7.3 - 9 gives a better volcanic response
var Co = 106;     // *60*60*24*365; //W yr/m2/K
var L = 1;        // 1.13 from GEOFFROY, but 1 matches more closely to CMIP5 multi-model mean
var g = 0.73;     // heat exchange parameter W/m2/K
var eps = 0.6;    // Internal variavility magnitude
var vtau = 1.2;   // yr Volcanic aerosol decay timescale
var alb0 = 0.31;   // initial albedo
var AF = -0.0052; // conversion from SO2 emissions to RF W/m2/TgSO2/yr
var VF = -20;     // conversion from optical thickness of volcanic aerosols to RF

// Constants for ocean carbon model (glotter)
var d = 50;       // ratio of upper to deep ocean volume
var ka = 1 / 5;     // Glotter paper suggests 1/5
var kd = 1 / 20;    // Glotter paper suggests 1/20
var OM = 7.8e22;  // moles of water in ocean
var AM = 1.77e20; // moles of air in atmosphere
var Alk = 767; // Alkalinity; assumed constant here but buffered on long timescales O[10ka] from the dissolution of CaCO3
var kh = 1.0548e+03;  // at 15oC; ratio of the molar concentrations of CO2 in atmosphere and ocean (Henry's Law)
var k1 = 8.7184e-07;  // at 15oC; dissociation constant
var k2 = 5.4426e-10;  // at 15oC; dissociation constant
var A = kh * AM / (OM / (d + 1)); // A is the ratio of mass of CO2 in atmospheric to upper ocean dissolved CO2, percentage i.e. A is inversely proportional to
// CO2 solubility. A is temperature dependent, however the percentage effect is small and has been neglected here.
var A = 132.216074 // Slightly different to above in order to have equilibrium at 1850

// Constants for Terrestrial model (Svirezhev)
var m = 8.7e-2;   // /yr  1/residence time of carbon in vegetation
var a2 = 4.7e-4;  // /GtC //strength of CO2 fertilisation
var dr0 = 0.024625; //0.025;  percentage/yr decomposition rate of soil
var e = 0.5;      // proportion of vegetation that forms soil (remainder goes to atmosphere)

// constant for Aragonite calculation
var Ksp = pow(10, -6.19); // = 6.4565e-7 (aragonite dissolution constant at 25degC)

// Constants for methane model
var tau_ch4_pi = 8; // pre industrial methane decay
var alpha_ch4 = -0.12;

// Constants for internal variability model
var iv_autocorr = 0.5;    // 1 month autocorrelation of observed global surface (land + ocean) temperature
var iv_var = 0.012;       // variance of observed global surface (land + ocean) temperature
var iv_alpha = pow(iv_autocorr, 12 * DT); //  autoregressive model parameter (autocorrelation for one model timestep)
var iv_beta = sqrt(iv_var) * sqrt(1 - square(iv_alpha)); //  autoregressive model parameter

// Constants for semi-empirical sea level model
// NB these values are different to those given by Rahmstorf et al 2011. Given that initial time is considered to be equilbrium conditions
// si_To is set to 0 (in Rahmstorf the only way they can fit to observations is to have SLR already in progress at 1850)
// Parameter values dives SLR of ~20cm (as observed) to 2000 and a 20th
// century SLR of ~100cm under RCP85. Also gives ~6m SLR at 2500 under RCP85
var si_a = 1; // mm/yr/oC
var si_b = 200;
var si_To = 0;

// radiative forcing to bulb conversion (assume 60W bulb and 100x50m football pitch)
var nobulbs = 1; // 100*50/60; // no of bulbs/(W/m2)