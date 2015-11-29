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

// square function for cleaner calculations in the model code
var square = function(num) {
	return pow(num, 2);
};

// log 10 function, which some browsers (older browsers + all Internet Explorer versions) don't support
var log10 = Math.log10 || function(x) {
	return Math.log(x) / Math.LN10;
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
}
