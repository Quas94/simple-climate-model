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

// updates the supplied dataset when the year range has changed
var yearsAltered = function(data, range) {
    // loop through every year of the new range
    // if before old range, set to same as the value of first year in old range
    // if after old range, set to same as the value of last year in old range
    // otherwise just copy
    var curYearBase = range.newMin;
    while (curYearBase <= range.newMax) {
        for (var curYear = curYearBase; curYear < curYearBase + 1; curYear += DEFAULT_SIM_CONSTS.DT) {
            // go through 1 time step at a time
            if (curYear <= range.min) {
                // before old range

            } else if (curYear >= range.max) {
                // after old range

            } else {
                // within old range, simply copy

            }
        }
        curYearBase++;
    }
};
