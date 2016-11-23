/**
 * Constants file
 *
 * Contains default scenarios and non-simulation-related constants.
 */

/**
 * Default values for inputs if not specified in import file
 */
var DEFAULT_TSI_VALUE = 1365;
var DEFAULT_ALB_VALUE = 0.31;

/**
 * Simulation year bounds and constraints
 */
var MIN_SIMULATION_YEAR = 0;
var MAX_SIMULATION_YEAR = 10000;
var MIN_NUM_YEARS = 100; // scenarios cannot run for less than 100 years

/**
 * Default scenarios
 *
 * Attribute 'isdefault' defines this scenario as a default scenario, that can't be deleted as opposed to user-created custom scenarios.
 */
var DEFAULT_SCENARIOS = [
	// id = 0 signifies no scenario
	{ id: 1, name: 'RCP3', isdefault: true },
	{ id: 2, name: 'RCP4.5', isdefault: true },
	{ id: 3, name: 'RCP6', isdefault: true },
	{ id: 4, name: 'RCP8.5', isdefault: true },
	{ id: 7, name: 'CO2 Pulse', isdefault: true },
	{ id: 8, name: 'CH4 Pulse', isdefault: true },
	{ id: 9, name: 'White Roofs', isdefault: true },
	{ id: 10, name: 'GeoEng-1', isdefault: true },
	{ id: 11, name: 'GeoEng-2', isdefault: true },
	{ id: 13, name: 'No Emissions', isdefault: true },
	{ id: 16, name: 'Solar Vars', isdefault: true },
	{ id: 17, name: 'Mega Volcano', isdefault: true },
];

var getDefaultScenarioNameById = function(id) {
	for (var i = 0; i < DEFAULT_SCENARIOS.length; i++) {
		if (DEFAULT_SCENARIOS[i].id == id)
			return DEFAULT_SCENARIOS[i].name;
	}
	throw Error('Default scenario with id = ' + id + ' not found');
};

/**
 * The id number at which custom scenarios begin.
 */
var CUSTOM_SCENARIO_ID_START = 100;

/**
 * Chart div ids
 *
 * Changing output charts also requires changing ids in simulate.js around line ~250 (variable 'simulatedData')
 */
var INPUT_CHART_INFOS = [
	{ id: 'chart-co2-emissions', name: 'CO2 Emissions', varname: 'CO2', lines: 1 },
	{ id: 'chart-ch4-emissions', name: 'CH4 Emissions', varname: 'CH4', lines: 1 },
	{ id: 'chart-so2-emissions', name: 'SO2 Emissions', varname: 'SO2', lines: 1 },
	{ id: 'chart-alb', name: 'Albedo', varname: 'alb', lines: 1 },
	{ id: 'chart-solar-input', name: 'Solar Input', varname: 'TSI', lines: 1 },
	{ id: 'chart-volc-emissions', name: 'Volcanic Emissions', varname: 'volc', lines: 1 },
];
var INPUT_AXIS_LABELS = {
	CO2: 'CO2 emissions (GtC/yr)',
	CH4: 'Methane emissions (TgCH4/yr)',
	SO2: 'Aerosol emissions (TgSO2/yr)',
	TSI: 'Solar energy (W/m2)',
	volc: '',
	alb: '',
};

var OUTPUT_CHART_INFOS = [
	{
		id: 'chart-gg',
		name: 'Greenhouse Gases',
		lines: 2,
		legend: {
			'red': 'CO2',
			'blue': 'CH4'
		}
	},
	{
		id: 'chart-aerosols',
		name: 'Aerosols',
		lines: 2,
		legend: {
			'red': 'SO2',
			'blue': 'Volcanic emissions'
		}
	},
	{
		id: 'chart-solar',
		name: 'Solar',
		lines: 1
	},
	{
		id: 'chart-at-up-lo',
		name: 'AT, UP & LO Inventories',
		lines: 3,
		legend: {
			'red': 'AT',
			'blue': 'UP',
			'green': 'LO'
		}
	},
	{
		id: 'chart-veg-soil-npp',
		name: 'Veg, Soil & NPP Inventories',
		lines: 3,
		legend: {
			'red': 'Vegetation Carbon',
			'blue': 'Soil Carbon',
			'green': 'NPP'
		}
	},
	{
		id: 'chart-ph',
		name: 'pH',
		lines: 1
	},
	{
		id: 'chart-lw',
		name: '60W Light Bulbs',
		lines: 5,
		legend: {
			'red': 'bulbs_in_lw',
			'blue': 'bulbs_in_sw',
			'green': 'bulbs_out_lw',
			'orange': 'bulbs_out_sw',
			'black': 'bulbs_net'
		}
	},
	{
		id: 'chart-sea-level',
		name: 'Sea Level Change',
		lines: 1
	},
	{
		id: 'chart-ch4-concentration',
		name: 'CH4 Concentration',
		lines: 1
	},
	{
		id: 'chart-co2-concentration',
		name: 'CO2 Concentration',
		lines: 1
	},
	// Chartbase has to come last as it doesn't have absolute positioning
	{
		id: 'base-chart-temperatures',
		name: 'Surface and Ocean Temperatures',
		lines: 2,
		legend: {
			'red': 'Surface',
			'blue': 'Ocean'
		}
	}
];
var OUTPUT_AXIS_LABELS = {
	'base-chart-temperatures': 'Temperature change (°C)',
	'chart-co2-concentration': 'Atmospheric CO2 (ppm)',
	'chart-ch4-concentration': 'Atmospheric methane (ppb)',
	'chart-gg': 'CO2/CH4 radiative forcing (W/m²)',
	'chart-aerosols': 'Aerosol radiative forcing (W/m²)',
	'chart-solar': '',
	'chart-at-up-lo': 'Carbon inventories (GtC)',
	'chart-veg-soil-npp': 'Carbon inventories (GtC)',
	'chart-ph': '',
	'chart-lw': '',
	'chart-sea-level': 'Sea level change (m)',
};

/**
 * CSS Style value constants
 */
var VISIBLE = 'visible';
var HIDDEN = 'hidden';

/**
 * Default forcings settings
 */
var DEFAULT_FORCINGS = {
	F1: 1, // CO2
	F2: 1, // CH4
	F3: 1, // SO2
	F4: 1, // Volcanics
	F5: 1, // Solar
	F6: 0, // Internal variability
};
// strings to describe each forcing variable
var FORCINGS_NAMES = [
	'error: this should not be shown (1)', // index 0
	'CO2',
	'CH4',
	'SO2',
	'Volcanics',
	'Solar',
	'Internal variability'
];
// variable name corresponding to each forcing (except 5. solar and 6. internal variability)
var FORCINGS_VARNAMES = [
	'error: this should not be shown (2)',
	'CO2',
	'CH4',
	'SO2',
	'volc',
	'TSI'
];

/**
 * Default simulation constants
 */
var DEFAULT_SIM_CONSTS = {
	DT: 1 / 12, // needs to be small otherwise ocean chanistry calculations become unstable

	m: 8.7e-2,   // /yr  1/residence time of carbon in v	// switches for forcing
	// forcing (F1 - F6) used to be here, now moved to reside in app.js's scope

	//// Model ////////////////////////////////////////////////////////////////////////////////////////
	// Temperature model from GEOFFROY et al.(2013), parameter values based on CMIP5 multi-model mean
	// Carbon cycle model based on simplified Glotter (ocean) and Svirezhev (terrestrial)

	// Constants for temperature model
	Cs: 9,       // *60*60*24*365, //W yr/m2/K (Geoffroy uses 7.3 - 9 gives a better volcanic response
	Co: 106,     // *60*60*24*365, //W yr/m2/K
	L: 1,        // 1.13 from GEOFFROY, but 1 matches more closely to CMIP5 multi-model mean
	g: 0.73,     // heat exchange parameter W/m2/K
	eps: 0.6,    // Internal variavility magnitude
	vtau: 1.2,   // yr Volcanic aerosol decay timescale
	alb0: 0.31,   // initial albedo
	AF: -0.0052, // conversion from SO2 emissions to RF W/m2/TgSO2/yr
	VF: -20,     // conversion from optical thickness of volcanic aerosols to RF

	// Constants for ocean carbon model (glotter)
	d: 50,       // ratio of upper to deep ocean volume
	ka: 1 / 5,     // Glotter paper suggests 1/5
	kd: 1 / 20,    // Glotter paper suggests 1/20
	OM: 7.8e22,  // moles of water in ocean
	AM: 1.77e20, // moles of air in atmosphere
	Alk: 767, // Alkalinity, assumed constant here but buffered on long timescales O[10ka] from the dissolution of CaCO3
	kh: 1.0548e+03,  // at 15oC, ratio of the molar concentrations of CO2 in atmosphere and ocean (Henry's Law)
	k1: 8.7184e-07,  // at 15oC, dissociation constant
	k2: 5.4426e-10,  // at 15oC, dissociation constant
	// A: kh * AM / (OM / (d + 1)), // ratio of mass of CO2 in atmospheric to upper ocean dissolved CO2,
	// percentage CO2 solubility. A is temperature dependent, however the percentage effect is small and has been neglected here.

	A: 132.216074, // Slightly different to above in order to have equilibrium at 1850

	// Constants for Terrestrial model (Svirezhev)egetation
	a2: 4.7e-4,  // /GtC //strength of CO2 fertilisation
	dr0: 0.024625, //0.025,  percentage/yr decomposition rate of soil
	e: 0.5,      // proportion of vegetation that forms soil (remainder goes to atmosphere)

	// constant for Aragonite calculation
	Ksp: pow(10, -6.19), //: 6.4565e-7 (aragonite dissolution constant at 25degC)

	// Constants for methane model
	tau_ch4_pi: 8, // pre industrial methane decay
	alpha_ch4: -0.12,

	// Constants for internal variability model
	iv_autocorr: 0.5,    // 1 month autocorrelation of observed global surface (land + ocean) temperature
	iv_var: 0.012,       // variance of observed global surface (land + ocean) temperature
	// NOTE: iv_alpha and iv_beta are set at the bottom, outside curly braces due to self-reference

	// Constants for semi-empirical sea level model
	// NB these values are different to those given by Rahmstorf et al 2011. Given that initial time is considered to be equilbrium conditions
	// si_To is set to 0 (in Rahmstorf the only way they can fit to observations is to have SLR already in progress at 1850)
	// Parameter values dives SLR of ~20cm (as observed) to 2000 and a 20th
	// century SLR of ~100cm under RCP85. Also gives ~6m SLR at 2500 under RCP85
	si_a: 1, // mm/yr/oC
	si_b: 200,
	si_To: 0,

	// radiative forcing to bulb conversion (assume 60W bulb and 100x50m football pitch)
	nobulbs: 1, // 100*50/60, // no of bulbs/(W/m2)
};

// self-referencing assignments can't be done inside the curly braces above
// autoregressive model parameter (autocorrelation for one model timestep)
DEFAULT_SIM_CONSTS.iv_alpha = pow(DEFAULT_SIM_CONSTS.iv_autocorr, 12 * DEFAULT_SIM_CONSTS.DT);
// autoregressive model parameter
DEFAULT_SIM_CONSTS.iv_beta = sqrt(DEFAULT_SIM_CONSTS.iv_var) * sqrt(1 - square(DEFAULT_SIM_CONSTS.iv_alpha));
