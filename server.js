const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const https = require('https');

//TODO move to module to routes folder

// Rate calculator w09
const rateCalculator = require('./_rateCalculator');
// Team w10
const team09 = require('./_team09');
// Account route ?
const account = require('./_account');

express()
	.use(express.static(path.join(__dirname, 'public')))// Set safe folder for static files
	.set('views', path.join(__dirname, 'views'))// Set views to path
	.set('view engine', 'ejs')// Set the view engine to ejs
	.get('/', (req, res) => res.render('pages/index'))
	// Rate calculator w09
	.get('/getRate', rateCalculator.getRate)

	// Team w10
	.get('/person', (req, res) => res.render('pages/person'))
	.get('/getPeople', team09.getPeople)
	.get('/getPerson', team09.getPerson)
	.get('/getParent', team09.getParent)
	.get('/getChild', team09.getChild)

	// Login system
	.use('/account', account)

	//.get('/login', (req, res) => res.render('pages/login'))
	//.post('/login', login)
	//.delete('/logout', logout)
	//.get('/register', (req, res) => res.render('pages/register'))
	//.post('/register', register)

	// Calendar
	.get('/calendar', (req, res) => res.render('pages/calendar'))
	.get('/holidayAPI/year/:year', holidayAPI)
	.get('/holidayAPI/year/:year/month/:month', holidayAPI)

	.listen(PORT, () => console.log(`Listening on ${ PORT }`));


// Support Funtions

function holidayAPI(req, res){
	year = req.params.year;
	month = req.params.month;

	if(!isNaN(month) && month >= 1 && month <= 12) {
		qStr = '?y=' + year + '&m=' + month;
	} else {
		qStr = '?y=' + year;
	}

	let url = 'https://secret-scrubland-75850.herokuapp.com/holidayAPI/index.php' + qStr;

	https.get(url, (response) => {
		let body = '',
			json_data;

		response.on('data', (stream) => {
			body += stream;
		});

		response.on('end', () => {
			if (response.statusCode === 200) {
				try {
					var data = JSON.parse(body);
					// do something with JSON
					res.json(data);
				} catch (e) {
					console.log('Error parsing JSON!');
				}
			} else {
				console.log('Status:', response.statusCode);
			}
		});

	}).on('error', (err) => {
		console.log(err);
	});
}