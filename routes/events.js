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
router.get('/', function(req, res, next) {
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

//post user
router.post('/', function(req, res, next) {
	console.log("Saving event....")
	const sql = 'INSERT INTO project02.event(username, password) VALUES($1, $2) returning event_id';
	const params = [req.body.username, req.body.password];

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});

//get one user
router.get('/:id', function(req, res, next) {
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
// update user
router.put('/:id', function(req, res, next) {
	console.log("Updating event....")
	const sql = 'UPDATE project02.event SET username = $2, password = $3  WHERE event_id = $1::int';
	var params = [req.params.id, req.body.username, req.body.password];
	
	pool.query(sql, id, function(err, result) {
		// If an error occurred...
		if (err) {
			return console.error('error running query', err);
		}
		res.json(JSON.stringify(result.rows))
	})
});
//delete one user
router.delete('/:id', function(req, res, next) {
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