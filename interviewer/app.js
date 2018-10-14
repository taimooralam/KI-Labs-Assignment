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

var port = process.env.PORT || 8082; // set out port


var Interviewer = require('./app/models/interviewer');



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

//test the router to make sure everything is working (accessed at GET http://localhost:8082/api)

router.get('/', function(req, res){
    res.json({message: 'hooray our app is working'});
})

// on routes that end in /retaurants
// -----------------------------------------------------------------------------

router.route('/interviewers')
//create a interviewer accessed as POST http://localhost:8082/api/interviewers
.post(
    async (req , res) => {
        try {
            if(req.body){
                
                var interviewer = new Interviewer(req.body); // create a new instance of interviewer
                await interviewer.save();

                res.status(201); res.json(interviewer);
            }else{
                res.statusMessage = 'No interviewer in body'; res.status(500).end();
            }
        } catch (error) {
            res.statusMessage = error; res.status(400).end();
        }
        
    }  
)

//get all interviewer accessed as GET http://localhost:8082/api/interviewer
.get(
    async (req , res) => {

        try {
            let interviewers = await Interviewer.find().exec();
            res.status(200); res.json(interviewers);
                
        } catch (error) {
            res.statusMessage = 'Cannot find interviewers'; res.status(500).end();
        }
    }  
)

//helper method to delete al interviewers accessed as DELETE http://localhost:8081/api/interviewers
.delete(
    async(req, res) => {
        try{
            await Interviewer.remove({});
            res.status(204); res.send();
        }catch(error){
            res.statusMessage = 'Cannot delete interviewers'; res.status(500).end();
        }
    }
)



// on routes that end in /interviewers/:interviewerId
// -----------------------------------------------------------------------------

router.route('/interviewers/:interviewerId')
//get a interviewer with an ID accessed as GET http://localhost:8082/api/interviewers/:interviewerId
.get(
    async (req , res) => {

        try {
            let id = req.params.interviewerId
            console.log(id);
            var interviewer = await Interviewer.findOne({_id: id}).exec();
            if(interviewer == null) throw new Error('Cannot get the interviewer from id: ' + id);
            res.status(200); res.json(interviewer);
            
        } catch (error) {
            res.statusMessage = error; res.status(400).end();   
        }
    }  
)

//update a interviewer accessed as PUT http://localhost:8082/api/interviewers/:interviewerId
.put(
    async (req , res) => {
        try {
            if(req.body){

                var inputinterviewer = req.body;
                const id = req.params.interviewerId;

                //checking conditions of the input_interviewer
                var data = {};
                if ('name' in inputinterviewer) data.name = inputinterviewer.name;
                if ('availability' in inputinterviewer) data.availability = inputRestaurant.availability;
    
                // promise to update the interviewer
                let results = await Interviewer.update({_id: id},{$set: data}).exec();
                res.status(200); res.json(results);
            }else{
                throw new Error('No body in PUT request');
            }
        } catch (error) {
            res.statusMessage = error; res.status(404).end();
        }
        
    }  
)

//delete a interviewer accessed as DELETE http://localhost:8082/api/interviewers/:interviewerId
.delete(
    async (req , res) => {
        try {
            const id = req.params.interviewerId;
            var interviewer = await Interviewer.findOne({_id: id}).lean().exec();
            if (interviewer == null){
                throw new Error('Cannot find interviewer with the following ID: '+id);
            }
            await Interviewer.remove({"_id": id});

            res.status(202); res.send();
        } catch (error) {
            res.statusMessage = error; res.status(404).end();
        }
    }  
)


//append a single time slot to interviewer's availability  POST http://localhost:8081/api/interviewers/:interviewerId/timeslots
.post(
    async (req , res) => {

        try {
            let id = req.params.interviewerId
            if(!req.body){
                throw new Error('No body in POST request');
            }
            let interviewer = await Interviewer.findOne({_id: id});
            if (interviewer == null){
                res.status(404).end();
            }else{
                let results = await Interviewer.update({_id: id},{$push: {
                    availability: req.body
                }}).exec();
                res.status(200); res.json(results);
            }
            
            
        } catch (error) {
            res.statusMessage = error; res.status(400).end();   
        }
    }  
)


// on routes that end in /interviewers/:interviewerId/availability
// -----------------------------------------------------------------------------
router.route('/interviewers/:interviewerId/availability')
//get a interviewers timeslots  http://localhost:8081/api/interviewers/:interviewerId/availability
.get(
    async (req , res) => {

        
        try {
            let id = req.params.interviewerId;
            let from = new Date(req.query.from);
            let to  = new Date(req.query.to);
            //give a yes if there is an element in an array where the from is less than the from and to is greater than to
            let results = await Interviewer.find({_id: id, availability: {$elemMatch: { $and: [{from: {$lte: from}}, {to: {$gte: to}}]}}}, {_id: 0, availability: 1});
            res.status(200);
            console.log(results);
            res.json({availability: results.length != 0});
            
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
