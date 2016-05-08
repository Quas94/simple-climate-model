/**
 * Contains all detailed descriptions for the default scenarios.
 *
 * Separated from constants.js because descriptions will presumably be pretty long.
 *
 * HTML is allowed in the descriptions.
 */

// how many characters to show in the brief description (ie. on the main page and not in the popup dialog)
var DESCRIPTION_CUTOFF_LIMIT = 140; // approximately 2 lines of text

var DESCRIPTIONS = [];

// array index corresponds to scenario id. check constants.js
DESCRIPTIONS[1] = 'Radiative forcing reaches 3.1 W/m2 before it returns to 2.6 W/m2 by 2100. This is achieved via ambitious greenhouse gas emissions reductions.\
	<div class="padding-10px"></div>\
	<ul>\
		<li>Declining use of oil</li>\
		<li>Low energy intensity</li>\
		<li>A world population of 9 billion by year 2100</li>\
		<li>Use of croplands increase due to bio-energy production</li>\
		<li>More intensive animal husbandry</li>\
		<li>Methane emissions reduced by 40 per cent</li>\
		<li>CO2 emissions stay at today’s level until 2020, then decline and become negative in 2100</li>\
		<li>CO2 concentrations peak around 2050, followed by a modest decline to around 400 ppm by 2100</li>\
		<li>Developed by PBL Netherlands Environmental Assessment Agency</li>';
DESCRIPTIONS[2] = '<strong>This RCP is developed by the Pacific.</strong> Here radiative forcing is stabilised shortly after year 2100 resulting from relatively ambitious future emissions reductions.\
	<div class="padding-10px"></div>\
	<ul>\
		<li>Lower energy intensity</li>\
		<li>Strong reforestation programmes</li>\
		<li>Decreasing use of croplands and grasslands due to yield increases and dietary changes</li>\
		<li>Stringent climate policies</li>\
		<li>Stable methane emissions</li>\
		<li>CO2 emissions increase only slightly before decline commences around 2040</li>\
		<li>Comparable to old SRES B1 scenario</li>\
		<li>Developed by Northwest National Laboratory in the US</li>';
DESCRIPTIONS[3] = 'Radiative forcing is stabilised shortly after year 2100. This is achieved through the application of a range of technologies and strategies for reducing greenhouse gas emissions.\
	<div class="padding-10px"></div>\
	<ul>\
		<li>Heavy reliance on fossil fuels</li>\
		<li>Intermediate energy intensity</li>\
		<li>Increasing use of croplands and declining use of grasslands</li>\
		<li>Stable methane emissions</li>\
		<li>CO2 emissions peak in 2060 at 75 per cent above today\'s levels, then decline to 25% above today</li>\
		<li>Comparable to old SRES B2 scenario</li>\
		<li>Developed by the National Institute for Environmental Studies in Japan.</li>';
DESCRIPTIONS[4] = 'Often referred to as "Business as Usual". In this scenario there are no policy changes to reduce emissions with rapid build-up greenhouse gas concentrations over time.\
	<div class="padding-10px"></div>\
	<ul>\
		<li>Three times today\'s CO2 emissions by 2100</li>\
		<li>Rapid increase in methane emissions</li>\
		<li>Increased use of croplands and grassland which is driven by an increase in population</li>\
		<li>A world population of 12 billion by 2100</li>\
		<li>Lower rate of technology development</li>\
		<li>Heavy reliance on fossil fuels</li>\
		<li>High energy intensity</li>\
		<li>No implementation of climate policies</li>\
		<li>Comparable to old SRES A1 F1 scenario</li>\
		<li>Developed by the International Institute for Applied System Analysis in Austria</li>';
DESCRIPTIONS[7] = '<p>How would temperatures react to sudden release in CO2?</p><p>All forcing is kept constant except (i.e. zero emissions) for a 10 year pulse of carbon dioxide (between years 5 and 15) at a rate of 20 PgC/yr. Simulation extends for 2000 years.</p>';
DESCRIPTIONS[8] = '<p>How would temperatures react to sudden release in methane?</p><p>All forcing is kept constant (i.e. zero emissions) except for a 10 year pulse of methane (between years 5 and 15) at a rate of 1000 TgC/yr. Simulation extends for 2000 years.</p>';
DESCRIPTIONS[9] = '<p>What would happen if we made the planet more reflective?</p><p>In this test scenario forcing is kept constant (i.e. zero emissions) except for a jump in the albedo (i.e. an increase in the planetary reflectivity) from 0.31 to 0.4 between years 100 and 1000. Simulation extends for 2000 years.</p>';
DESCRIPTIONS[10] = '<p>Can we pump aerosols into the atmosphere to counteract warming?</p><p>Emissions follow the RCP85 scenario except anthropogenic aerosol emissions are ramped up considerably over the course of the 21st century.</p>';
DESCRIPTIONS[11] = '<p>What happens if geoengineering technology suddenly fails?</p><p>Emissions follow the RCP85 scenario except anthropogenic aerosol emissions are ramped up considerably over the course of the first part of the 21st century. At 2070 aerosol emissions are brought down to zero (to simulate the failure of the geoengineering technology).</p>';

DESCRIPTIONS[13] = '<p>What would happen if we suddenly stopped all greenhouse gad and aerosol emissions?</p><p>Emissions initially grow follow the RCP85 scenario but are suddenly reduced to zero in 2020 when fusion technology replaces all energy production.</p>';

DESCRIPTIONS[16] = '<p>What happens of Solar output increase or decrease?</p><p>In this test scenario all forcing is kept constant (i.e. zero emission) except that solar radiation is increased or decreased for two 10 year periods. Simulation extends for 150 years.</p>';
DESCRIPTIONS[17] = '<p>How does a large volcanic eruption change global temperatures?</p><p>In this test scenario all forcing is kept constant (i.e. zero emission) except that between 2000 and 2002 large amounts of volcanic aerosols are released into the atmosphere.</p>';
