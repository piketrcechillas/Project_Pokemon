ExperienceControl._getGrowthValue = function(n) {
		var value, value2;
		var isMunus = false;
		
		if (n < 0) {
			n *= -1;
			isMunus = true;
		}

		n = n*100;
		
		// For instance, if n is 270, 2 rise for sure.
		// Moreover, 1 rises with a probability of 70%.
		value = Math.floor(n / 100);
		value2 = Math.floor(n % 100);
		
		if (Probability.getProbability(value2)) {
			value++;
		}
		
		if (isMunus) {
			value *= -1;
		}
		
		return value;
	}