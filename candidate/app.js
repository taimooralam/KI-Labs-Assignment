//helloworld.js

// call the packages we need

var express = require('express'); // call express
var app = express(); // define our app using epress
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors')

mongoose.connect('mongodb://localhost:27017/ki', {useNewUrlParser: true}); // connect to our database

// configure the app to use the bodyParser
// this will help us get data from the POST

app.use(bodyParser.urlencoded({extended :true}));
app.use(bodyParser.json());
app.use(cors())

var port = process.env.PORT || 8081; // set out port



// Pull the bear file from the bear model into helloworld.js

var Candidate = require('./app/models/candidate');



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

// on routes that end in /retaurants
// -----------------------------------------------------------------------------

router.route('/candidates')
//create a candidate accessed as POST http://localhost:8080/api/candidates
.post(
    async (req , res) => {
        try {
            if(req.body){
                console.log(req.body);
                var candidate = new Candidate(req.body); // create a new instance of candidate
                if(candidate.availability){
                    for (i in candidate.availability){
                        var from = new Date(candidate.availability[i].from).getTime() % 3600;
                        var to = new Date(candidate.availability[i].to).getTime()%3600;
                        if(! from == 0 &&  to == 0){
                            throw new Error("Invalid time slot: make sure that values are multiples of hours");
                        }
                    }
                }
                
                await candidate.save();

                res.status(201); res.json(candidate);
            }else{
                res.statusMessage = 'No candidate in body'; res.status(500).end();
            }
        } catch (error) {
            res.statusMessage = error; res.status(400).end();
        }
        
    }  
)

//get all candidate accessed as GET http://localhost:8080/api/candidate
.get(
    async (req , res) => {

        try {
            let candidates = await Candidate.find().exec();
            res.status(200); res.json(candidates);
                
        } catch (error) {
            res.statusMessage = 'Cannot find candidates'; res.status(500).end();
        }
    }  
)

//helper method to delete al candidates accessed as DELETE http://localhost:8081/api/candidates
.delete(
    async(req, res) => {
        try{
            await Candidate.remove({});
            res.status(204); res.send();
        }catch(error){
            res.statusMessage = 'Cannot delete candidates'; res.status(500).end();
        }
    }
)



// on routes that end in /candidates/:candidateId
// -----------------------------------------------------------------------------

router.route('/candidates/:candidateId')
//get a candidate with an ID accessed as GET http://localhost:8080/api/candidates/:candidateId
.get(
    async (req , res) => {

        try {
            let id = req.params.candidateId
            console.log(id);
            var candidate = await Candidate.findOne({_id: id}).exec();
            if(candidate == null) throw new Error('Cannot get the candidate from id: ' + id);
            res.status(200); res.json(candidate);
            
        } catch (error) {
            res.statusMessage = error; res.status(400).end();   
        }
    }  
)

//update a candidate accessed as PUT http://localhost:8080/api/candidates/:candidateId
.put(
    async (req , res) => {
        try {
            if(req.body){

                var inputCandidate = req.body;
                const id = req.params.candidateId;

                //checking conditions of the input_candidate
                var data = {};
                if ('name' in inputCandidate) data.name = inputCandidate.name;
                if ('availability' in inputCandidate) data.availability = inputRestaurant.availability;
                for (i in data.availability){
                    var from = new Date(data.availability[i].from).getTime() % 3600;
                    var to = new Date(data.availability[i].to).getTime()%3600;
                    console.log(from);
                    console.log(to);
                    if(! from == 0 &&  to == 0){
                        throw new Error("Invalid from or to values in availabilility: make sure that values are multiples of hours");
                    }
                    if(from >= to){
                        throw new Error("Invalid time slot, make sure from is before to.");
                    }
                }
    
                // promise to update the candidate
                let results = await Candidate.update({_id: id},{$set: data}).exec();
                res.status(200); res.json(results);
            }else{
                throw new Error('No body in PUT request');
            }
        } catch (error) {
            res.statusMessage = error; res.status(404).end();
        }
        
    }  
)

//delete a candidate accessed as DELETE http://localhost:8080/api/candidates/:candidateId
.delete(
    async (req , res) => {
        try {
            const id = req.params.candidateId;
            var candidate = await Candidate.findOne({_id: id}).lean().exec();
            if (candidate == null){
                throw new Error('Cannot find candidate with the following ID: '+id);
            }
            await Candidate.remove({"_id": id});

            res.status(202); res.send();
        } catch (error) {
            res.statusMessage = error; res.status(404).end();
        }
    }  
)

// on routes that end in /candidates/:candidateId/timeslots
// -----------------------------------------------------------------------------
router.route('/candidates/:candidateId/timeslots')
//get a candidates availability  http://localhost:8081/api/candidates/:candidateId/timeslots
.get(
    async (req , res) => {

        try {
            let id = req.params.candidateId
            console.log(id);
            var candidate = await Candidate.findOne({_id: id}).exec();
            if(candidate == null || candidate.availability == null) {
                res.status(204).end();
            }
            res.status(200); res.json(candidate.availability);
            
        } catch (error) {
            res.statusMessage = error; res.status(400).end();   
        }
    }  
)




//more routes for our API will happen here

//REGISTER OUR ROUTES
// all of our routes will be prefixed with /api

app.use('/api', router);



//START THE SERVER
// =========================================================================================================

app.listen(port);
console.log('**************************************************\n' + __dirname.toUpperCase() + ' happens on port: ' + port + '\n**************************************************\n');
