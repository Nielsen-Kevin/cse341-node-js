module.exports = {
	getRate: function (req, res) {
		//plain html
		res.setHeader('Content-Type', 'text/html');

		rate = calculateRate(
			req.query.mailType,
			Number(req.query.weight)
		);

		var getTitle = {
			Letters_Stamped: 'Letters (Stamped)',
			Letters_Metered: 'Letters (Metered)',
			Large_Envelopes: 'Large Envelopes (Flats)',
			Large_Envelopes: 'First-Class Package Service—Retail'
		}
		// Find mail type title:
		if(getTitle.hasOwnProperty(req.query.mailType)) {
			title = getTitle[req.query.mailType];
		} else {
			title = `Error! ${req.query.mailType} not found`;
		}

		res.render('pages/rate', {
			mailType: req.query.mailType,
			mailTypeTitle: title,
			weight: req.query.weight,
			rate: currency.format(rate)
		});
	}
};

// Rate calculate
const calculateRate = (mailType, weight) => {
	let rate = 0;
	let getRate;

	switch (mailType) {
		// Letters (Stamped)
		case 'Letters_Stamped':
			getRate = {
				1: 0.55,
				2: 0.75,
				3: 0.95,
				3.5: 1.15
			}
			break;

		// Letters (Metered)
		case 'Letters_Metered':
			getRate = {
				1: 0.51,
				2: 0.71,
				3: 0.91,
				3.5: 1.11
			}
			break;

		// Large Envelopes (Flats)
		case 'Large_Envelopes':
			getRate = {
				1:	1.00,
				2:	1.20,
				3:	1.40,
				4:	1.60,
				5:	1.80,
				6:	2.00,
				7:	2.20,
				8:	2.40,
				9:	2.60,
				10:	2.80,
				11:	3.00,
				12:	3.20,
				13:	3.40
			}
			break;

		// First-Class Package Service—Retail
		case 'Package':
			// just zone 1&2
			getRate = {
				1:	4.00,
				2:	4.00,
				3:	4.00,
				4:	4.00,
				5:	4.80,
				6:	4.80,
				7:	4.80,
				8:	4.80,
				9:	5.50,
				10:	5.50,
				11:	5.50,
				12:	5.50,
				13:	6.25
			}
			break;

		default:
			getRate = 'Error!';
			break;
	}

	if(getRate.hasOwnProperty(weight)) {
		rate = getRate[weight];
	}

	//returns the appropriate postage
	console.log(rate);
	return rate;
}

// Format currency
const currency = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 2
});