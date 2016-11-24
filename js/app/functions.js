/**
 * Functions file
 *
 * Imports, modifies and defines a bunch of mathematical functions for use by the application.
 *
 * @TODO: account for the fact that somme browsers (IE, Safari) don't support Number.EPSILON
 */

// import Math functions
var pow = Math.pow;

var sqrt = Math.sqrt;

var log = Math.log;

var cos = Math.cos;

// square function for cleaner calculations in the model code
var square = function(num) {
	return pow(num, 2);
};

// log 10 function, which some browsers (older browsers + all Internet Explorer versions) don't support
var log10 = Math.log10 || function(x) {
	return Math.log(x) / Math.LN10;
};

// rounds the given number to the given number of decimal places
var round = function(number, places) {
    return +(Math.round(number + 'e+' + places)  + 'e-' + places);
};

// binary search implementation. returns index of searchElement in arr
// if not found, returns (-insertionPoint - 1) where insertionPoint is the position
// in the array the element would be inserted
var binarySearch = function(arr, searchElement) {
    var minIndex = 0;
    var maxIndex = arr.length - 1;
    var currentIndex;
    var currentElement;
    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentElement = arr[currentIndex];
 
 		if (Math.abs(currentElement - searchElement) <= Number.EPSILON) {
 			return currentIndex;
        } else if (currentElement < searchElement) {
            minIndex = currentIndex + 1;
        } else if (currentElement > searchElement) {
            maxIndex = currentIndex - 1;
        }
    }
    var insertionPoint = Number.NaN;
    while (currentIndex < arr.length) {
    	if (arr[currentIndex] > searchElement) {
    		insertionPoint = currentIndex;
    		break;
    	}
    	currentIndex++;
    }
    if (isNaN(insertionPoint)) {
    	insertionPoint = arr.length;
    }
    return (-insertionPoint - 1);
};

// linear interpolation
var interp1 = function(x, y, xi) {
	var slope = [];
	var intercept = [];

	// calculate the line equation (i.e. slope and intercept) between each point
    for (var i = 0; i < x.length - 1; i++) {
	    var dx = x[i + 1] - x[i];
	    var dy = y[i + 1] - y[i];
	    slope[i] = dy / dx;
	    intercept[i] = y[i] - x[i] * slope[i];
    }

    // perform the interpolation
    var yi = [];
    for (var i = 0; i < xi.length; i++) {
    	if (xi[i] > x[x.length - 1] || xi[i] < x[0]) {
    		yi[i] = Number.NaN;
    	} else {
    		var loc = binarySearch(x, xi[i]); // binary search
    		if (loc < -1) {
    			loc = -loc - 2;
    			yi[i] = slope[loc] * xi[i] + intercept[loc];
    		} else {
    			yi[i] = y[loc];
    		}
    	}
    }

    return yi;
};

// returns a new array with values equivalent to Matlab term 'start:interval:end'
var interpC = function(start, interval, end) {
    var denominator = Math.round(1 / interval);

    var array = [];

    for (var i = start; i < end; i++) {
        for (var j = 0; j < denominator; j++) {
            array.push(i + (j * interval));
        }
    }
    array.push(end); // end can't be included in above for loop because of how the inner loop works

    return array;
};

// mean ignoring NaN values
var nanmean = function(array) {
    var total = 0;
    var nums = 0;
    for (var i = 0; i < array.length; i++) {
        if (!isNaN(array[i])) {
            total += array[i];
            nums++;
        }
    }
    return (total / nums);
};

// generates a random number
// right now this function just generates 4 random numbers between 0 and 3 and chooses the smallest one
// positive or negative is then randomly generated and tacked on before returning
var randn = function() {
    var a = Math.random() * 3;
    var b = Math.random() * 3;
    var c = Math.random() * 3;
    var d = Math.random() * 3;
    var num = Math.min(Math.min(a, b), Math.min(c, d));
    if (Math.random() >= 0.5) { // ~50% chance of negative
        num = -num;
    }
    return num;
};

// returns a deep copy of the array (no references)
var arrcpy = function(original) {
    var newArray = [];
    for (var i = 0; i < original.length; i++) {
        newArray[i] = original[i];
    }
    return newArray;
};

// returns the first index of the given array which contains the given needle to search for
var arrfind = function(haystack, needle) {
    for (var i = 0; i < haystack.length; i++) {
        if (haystack[i] == needle) {
            return i;
        }
    }
    throw new Error(needle + ' was not found in haystack, this should not happen');
};

// returns a deep copy of the given object via JSON functions
var objcpy = function(original) {
    return JSON.parse(JSON.stringify(original));
};

// subjects all numbers in the array by the first index
// for use before plotting (in simulate.js) for Cat, Cup, Clo, etc...
var subtractByFirstIndex = function(array) {
    var first = array[0];
    for (var i = 0; i < array.length; i++) {
        array[i] -= first;
    }
    return array;
};

// multiplies all elements in the given array by the given value
var multiplyAllBy = function(array, by) {
    for (var i = 0; i < array.length; i++) {
        array[i] *= by;
    }
    return array;
};

// checks whether or not the given parameter is a valid year
var isValidYear = function(year) {
    if (year === '') return false;
    if (isNaN(year)) return false;
    year = Number(year);
    if ((year % 1) !== 0) return false;
    if (year < 0 || year > MAX_SIMULATION_YEAR) return false;
    
    return true;
};

// creates an array of specified length, all with thhe given value
var createAndFillArray = function(length, value) {
    var ret = [];
    for (var i = 0; i < length; i++) {
        ret[i] = value;
    }
    return ret;
};

// checks whether all the arrays within the given array all have equal length
var arrLensEqual = function(twoDimArray) {
    if (twoDimArray.length < 2) {
        throw new Error('Param given to arrLensEqual() only has ' + twoDimArray.length + ' element(s).');
    }
    var len = twoDimArray[0].length;
    for (var i = 1; i < twoDimArray.length; i++) {
        if (twoDimArray[i].length !== len) {
            return false;
        }
    }
    return true;
};

// updates the supplied dataset when the year range has changed
var yearsAltered = function(data, range) {
    // check data lengths
    if (!arrLensEqual([data.emissions.CO2, data.emissions.CH4, data.emissions.SO2, data.emissions.volc, data.TSI, data.alb])) {
        throw new Error('Array lengths in data ');
    }
    // make a copy of old data
    var oldData = {
        // scenario: data.scenario,
        emissions: {
            CO2: arrcpy(data.emissions.CO2),
            CH4: arrcpy(data.emissions.CH4),
            SO2: arrcpy(data.emissions.SO2),
            volc: arrcpy(data.emissions.volc)
        },
        TSI: arrcpy(data.TSI),
        // mTSI: data.mTSI,
        alb: arrcpy(data.alb),
        years: arrcpy(data.years)
    };
    // clear the old data references
    data.emissions.CO2.length = 0;
    data.emissions.CH4.length = 0;
    data.emissions.SO2.length = 0;
    data.emissions.volc.length = 0;
    data.TSI.length = 0;
    data.alb.length = 0;
    data.years.length = 0;
    // loop through every year of the new range
    // if before old range, set to same as the value of first year in old range
    // if after old range, set to same as the value of last year in old range
    // otherwise just copy
    var curYearBase = range.newMin;
    // the index of the old year's array we're up to
    var oldYearIndex = -1;
    // var debugCount = 0;
    while (curYearBase <= range.newMax) {
        // set oldYearIndex to the start if we've entered the old range
        if (oldYearIndex === -1 && curYearBase >= range.min && curYearBase <= range.max) {
            // initialise the index to the correct value
            oldYearIndex = oldData.years.indexOf(curYearBase);
        }
        var one = 0.99; // rounding issues. if one == 1, then the 'for' loop below will iterate an extra time (0.9999... < 1)
        for (var curYear = curYearBase; curYear < curYearBase + one; curYear += DEFAULT_SIM_CONSTS.DT) {
            // if (debugCount < 100) { debugCount++; console.log(debugCount + ' - ' + curYear); }
            // add to years array
            data.years.push(curYear);
            var oldIndex;
            if (curYear <= range.min) {
                // before old range
                oldIndex = 0; // set to first index of old range
            } else if (curYear >= range.max) {
                // after old range
                oldIndex = oldData.emissions.CO2.length - 1; // all lengths should be equal, set to last index of old range
            } else {
                // within old range, simply copy
                oldIndex = oldYearIndex;
                // increment oldYearIndex
                oldYearIndex++;
            }
            // copy oldData[oldIndex] into data
            data.emissions.CO2.push(oldData.emissions.CO2[oldIndex]);
            data.emissions.CH4.push(oldData.emissions.CH4[oldIndex]);
            data.emissions.SO2.push(oldData.emissions.SO2[oldIndex]);
            // for volc data, if out of old range, set to 0 flat
            if (curYear >= range.min && curYear <= range.max) data.emissions.volc.push(oldData.emissions.volc[oldIndex]);
            else data.emissions.volc.push(0);
            // TSI and alb
            data.TSI.push(oldData.TSI[oldIndex]);
            data.alb.push(oldData.alb[oldIndex]);
            // don't push years, done at the top of this loop

            // if it's the very last year, don't do the time steps until just before the next year.
            if (curYearBase === range.newMax) {
                break;
            }
        }
        curYearBase++;
    }
};

// download file
var downloadAsCsv = function(data, fileName) {
    if (typeof fileName === 'undefined')
        throw Error('file name not specified in downloadAsCsv()');

    var csvString = data.join('\n');
    var a         = document.createElement('a');
    a.href        = 'data:attachment/csv,' +  encodeURIComponent(csvString);
    a.target      = '_blank';
    a.download    = fileName;

    document.body.appendChild(a);
    a.click();
};

var csvEscape = function(str) {
    str = str.replace('"', '""');
    str = '"' + str + '"';
    return str;
}
