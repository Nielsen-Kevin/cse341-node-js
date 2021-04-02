const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const https = require('https');
var session = require('express-session');

// Rate calculator w09
const rateCalculator = require('./routes/rateCalculator');
// Team w10
const team09 = require('./routes/team09');
// Account routes
const account = require('./routes/account');
// Events routes
const events = require('./routes/events');

express()
	.use(express.json()) // to support JSON-encoded bodies
	.use(express.urlencoded({ extended: true })) // to support URL-encoded bodies
	.use(express.static(path.join(__dirname, 'public')))// Set safe folder for static files
	.set('views', path.join(__dirname, 'views'))// Set views to path
	.set('view engine', 'ejs')// Set the view engine to ejs
	.use(logger) //Log request method and urls

	// set up sessions
	.use(session({
		secret: 'my-super-secret-secret!',//Need to change and move to env
		resave: false,
		saveUninitialized: true
	}))

	// Home Page
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

	// Calendar
	.get('/calendar', (req, res) => res.render('pages/calendar'))
	.get('/holidayAPI/year/:year', holidayAPI)
	.get('/holidayAPI/year/:year/month/:month', holidayAPI)

	//Event CRUD
	.use('/event', events)

	// Testing
	.post('/tp', testPOST)
	.get('/ts', testSession)

	.listen(PORT, () => console.log(`Listening on ${ PORT }`));

	// Support Funtions
function logger(req, res, next) {
	console.log(`Received a ${req.method} request for: ${req.url}`);
	next()
}

function testSession(req, res) {
	if (req.session.user) {
		console.log(req.session.user);
		var result = {success:true, message: "They are logged in!"};
		res.json(result);
	} else {
		var result = {success:false, message: "Access Denied"};
		res.status(401).json(result);
	}
}

function testPOST(req, res){
	console.log("Testing post....")
	console.log(req.body);
	res.json(JSON.stringify(req.body))
}

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