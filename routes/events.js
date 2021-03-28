if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

// Database Pool
const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false,
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
		res.json(JSON.stringify(result.rows))
		//res.send(result);
	})
});

router.get('/:year/:month', function(req, res) {
	console.log("Getting events....")
	year = req.params.year;
	month = req.params.month;

	//const sql = "SELECT * FROM project02.event WHERE YEAR(event_date) = $1 AND MONTH(event_date) = $2";
	const sql = "SELECT * FROM project02.event WHERE date_part('year', event_date) = $1 AND date_part('month', event_date) = $2";
	const params = [year, month];

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});

//post event
router.post('/', function(req, res) {
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
			'id': result.rows['event_id']
		}
		res.json(response);
	})
});

//get one event
router.get('/:id', function(req, res) {
	console.log("Getting event....")
	const sql = "SELECT * FROM project02.event WHERE event_id = $1::int";
	const params = [req.params.id];

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});
// update event
router.put('/:id', function(req, res) {
	console.log("Updating event....")
	const sql = 'UPDATE project02.event SET event_name = $2, event_date = $3, event_color = $4  WHERE event_id = $1::int';
	var params = [req.params.id, req.body.name, req.body.date, req.body.color];
	
	pool.query(sql, id, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});
//delete one event
router.delete('/:id', function(req, res) {
	console.log("Deleting events....")
	const sql = 'DELETE FROM project02.event WHERE event_id = $1::int';

	pool.query(sql, [req.params.id], function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});

module.exports = router;