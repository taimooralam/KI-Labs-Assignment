// the orchestrator that matches candidates witht their interviewers
var express = require('express'); //call express
var cors = require('cors');
var app = express(); //define our app using express
var rp = require('request-promise');
var bodyParser = require('body-parser');
//var mongoose = require('mongoose'); You should not need mongoose here for the time being

//configure the app to use the bodyParser
//this will help us get the data from the POST

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors());

var port = process.env.PORT || 8080;

//Call utils here if possible

//TP: you do not require any schemas here because you are getting the data from the database

// ROUTES FOR OUR API
// =========================================================================================================

// Uses of middleware
// We can do validations to see that everything coming in from the request is sound and safe. We can throw errors here in case
// something is wrong. We can do extra logging for analytics and statistics that we would like to keep. There are many possibilities
// here go wild


var router = express.Router();

// Note: The order of how we define the parts of our router is very important. They will run in the order in which they are listed. Thank
// to the changes in Express 4.0

// middleware to use for all requests
router.use(function(req, res, next){
    //do logging
    console.log('@ ' + req.method + ' ' + req.originalUrl);
    next(); // make sure that we go to the next routes and don't stop here

});

//test the router to make sure everything is working (accessed at GET http://localhost:8080/api)

router.get('/', function(req, res){
    res.json({message: 'hooray our app is working'});
})

router.route('/interviews/availability/search')
//query as GET http://localhost:8080/api/interviews/availability/search
.post(
    async(req, res) => {
        try {
		var final_time_slots = []; // the timeslots that match the candidate and the interviewers

		//validation check if from and to are correct
		
		//STEP 1. get availability for that candidate
	
		let candidate_timeslots = await rp({
			uri: "http://localhost:8081/api/candidates/" + req.body.candidate + "/timeslots",
			method: "GET",
			headers: {
				'User-Agent': 'Request-Promise'
			},
			json: true // Automatically parses the JSON string in the response
		 });
		console.log(candidate_timeslots);

		//STEP 2. for every candidate time slot available, query all the interviewers and check if ALL of them are available.
		for (candidate_timeslot_index in candidate_timeslots){
		//for every candidate time slot check if all interviewers match?
			var match = true;
			for (interviewer_index in req.body.interviewers){
				let result = await rp({
					uri: "http://localhost:8082/api/interviewers/" + req.body.interviewers[interviewer_index] + "/availability?from=" + candidate_timeslots[candidate_timeslot_index].from + "&to=" + candidate_timeslots[candidate_timeslot_index].to,
					method: "GET",
					headers: {
						'User-Agent': 'Request-Promise'
					},
					json: true // Automatically parses the JSON string in the response
				});
				console.log(result);
				match = match && result.availability;
			}
			if (match){
				delete candidate_timeslots[candidate_timeslot_index]._id;
				final_time_slots.push(candidate_timeslots[candidate_timeslot_index]);
			}	
		}
		//3. TODO retur the result
		console.log("*******");
		console.log(final_time_slots);
		res.status(200);
		res.json(final_time_slots);
        } catch (error) {
            console.log('ERROR OCCURRED: ' + error)
            res.statusMessage = error; res.status(500).end();
        }
    }
)

app.use('/api', router);

//START THE SERVER
// =========================================================================================================

app.listen(port);
console.log('**************************************************\n' + __dirname.toUpperCase() + ' happens on port: ' + port + '\n**************************************************\n');