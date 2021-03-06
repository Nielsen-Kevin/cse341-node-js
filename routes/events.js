if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// Database Pool
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false
	}
});
var express = require('express');
var router = express.Router();

//get all events
router.get('/', function(req, res) {
	console.log("Getting events....")
	const sql = "SELECT * FROM project02.event";

	pool.query(sql, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(result.rows)
		//res.send(result);
	})
});

router.get('/:year/:month', function(req, res) {
	console.log("Getting events by month....")

	//const sql = "SELECT * FROM project02.event WHERE YEAR(event_date) = $1 AND MONTH(event_date) = $2";
	const sql = `SELECT 
		event_id AS id, 
		event_name AS name, 
		date_part('day', event_date) AS day, 
		event_color AS color, 
		to_char(event_date, 'HH24:MI') AS time 
		FROM project02.event WHERE date_part('year', event_date) = $1 AND date_part('month', event_date) = $2`;
	const params = [req.params.year, req.params.month];

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(result.rows)
	})
});

//post event
router.post('/', verifyLogin, function(req, res) {
	console.log("Saving event....")

	const sql = 'INSERT INTO project02.event(event_name, event_date, event_color) VALUES($1, $2, $3) returning event_id';
	const params = [req.body.name, req.body.date, req.body.color];
	console.log(params);

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}

		let response = {
			'success': true,
			'id': result.rows[0]['event_id']
		}
		res.json(response);
	})
});

// update event
router.put('/:id', verifyLogin, function(req, res) {
	console.log("Updating event....")
	const sql = 'UPDATE project02.event SET event_name = $2, event_date = $3, event_color = $4 WHERE event_id = $1::int';
	const params = [req.params.id, req.body.name, req.body.date, req.body.color];
	console.log(params);
	
	 pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		let response = {
			'success': true,
			//'id': result.rows[0]['event_id']
		}
		//console.error(result);
		res.json(response);
	}) 
});
//delete one event
router.delete('/:id', verifyLogin, function(req, res) {
	console.log("Deleting events....")
	const sql = 'DELETE FROM project02.event WHERE event_id = $1::int returning event_id';

	pool.query(sql, [req.params.id], function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		let response = {
			'success': true,
			'id': result.rows[0]['event_id']
		}
		res.json(response)
	})
});

// Check access and return success
router.get('/access', verifyLogin, function(req, res) {
	var result = {success: true};
	res.json(result); 
});

// Middleware function to use with any request - check user is logged in
function verifyLogin(req, res, next) {
	if (req.session.user) {
		// They are logged in pass along to the next function
		next();
	} else {
		// They are not logged in Send back an unauthorized status
		var result = {success:false, message: "Access Denied"};
		res.json(result);
	}
}

module.exports = router;