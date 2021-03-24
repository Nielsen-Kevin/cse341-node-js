if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

// Database Pool
const { Pool } = require('pg')
const connectionString = process.env.DATABASE_URL;
//const pool = new Pool({connectionString: connectionString});
const pool = new Pool(
	{connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false
	}
});


function getPeople(req, res){
	var sql = "SELECT * FROM team10.person";

	pool.query(sql, function(err, result) {
		// If an error occurred...
		if (err) {
			console.log("Error in query: ")
			console.log(err);
		}
		res.json(result.rows)
	})
}

function getPerson(req, res){
	console.log("Getting persons....")
	var id = [req.query.id];

	const sql = "SELECT * FROM team10.person WHERE personid = $1::int";
	pool.query(sql, id, function(err, result) {
		// If an error occurred...
		if (err) {
			console.log("Error in query: ")
			console.log(err);
		}
		res.json(JSON.stringify(result.rows))
	})
}
/* function getPerson(req, res){
	console.log("Getting persons....")
	const id = req.query.id;
	console.log('id: ', id);

	// TODO: We should really check here for a valid id before continuing on...

	getPersonFromDb(id, function(error, result) {
		// This is the callback function that will be called when the DB is done.
		// The job here is just to send it back.

		// Make sure we got a row with the person, then prepare JSON to send back
		if (error || result == null || result.length != 1) {
			response.status(500).json({success: false, data: error});
		} else {
			const person = result[0];
			response.status(200).json(JSON.stringify(person));
		}
	});
}
function getPersonFromDb(id, callback) {
	console.log("Getting person from DB with id: " + id);

	const sql = "SELECT * FROM team10.person WHERE personid = $1::int";
	const params = [id];

	pool.query(sql, params, function(err, result) {
		// If an error occurred...
		if (err) {
			console.log("Error in query: ")
			console.log(err);
			callback(err, null);
		}

		// Log this to the console for debugging purposes.
		console.log("Found result: " + JSON.stringify(result.rows));

		// (The first parameter is the error variable, so we will pass null.)
		callback(null, result.rows);
	});
} */


function getParent(req, res){
	console.log("Getting parent....")
	var id = [req.query.id];

	const sql = "SELECT parent FROM team10.relationship WHERE child = $1::int";
	pool.query(sql, id, function(err, result) {
		// If an error occurred...
		if (err) {
			console.log("Error in query: ")
			console.log(err);
		}
		res.json(JSON.stringify(result.rows))
	})
}

function getChild(req, res){
	console.log("Getting child....")
	var id = [req.query.id];

	const sql = "SELECT child FROM team10.relationship WHERE parent = $1::int";
	pool.query(sql, id, function(err, result) {
		// If an error occurred...
		if (err || result == null) {
			console.log("Error in query: ")
			console.log(err);
		}
		res.json(JSON.stringify(result.rows))
	})
}

module.exports = {
	getPeople,
	getPerson,
	getParent,
	getChild
};