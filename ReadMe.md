# README

This is an assignment that creats an API based on microservices for an interviewers and candidates and matches one candidate and one or more interviewers for interviews.

To get started see Get Started heading below and import the data from the `data/` folder into your mongo database.

This app is based off of three microservices called the `candidates`, `interviewers` and `interviews`. The `candidates` and `interviewers` microservices manage the candidates and interviewers respectively using simple CRUD operations.

The `interviews` microservice is an orchestrator that gets the query for matching a candidate to one or more interviewers. Here is the following orchestrator query:

`POST http://localhost:8080/api/interviews/availability/search`
with body as:
```
{
	"candidate": "5bc34b119ec49f5fcec8d3f7",
	"interviewers": ["5bc34d80d66da7632ad8866b", "5bc34de3d66da7632ad88671"]
}
```
with this query and importing the data in the database, one can run and verify the example scenario of the timeslots of the candidate Carl and the interviewers Philip and Sarah given in the assignment.

All time stamps are stored and retreived in UTC timestamp.
The objects are identified by their Mongo Unique identifier in the rest API.

_for CRUD queries on the microservices `candidates/` and `interviewers/`, have a look at the postman collection_

All the models in are stored  in `app/models/` folder. The `app.js` is the main file that runs every microservices. The mongoose URL is given at beginning of each relevant `app.js` file.

## To get started.
Install Nodejs ([download](https://nodejs.org/en/download/)[Installation on Windows](https://blog.teamtreehouse.com/install-node-js-npm-windows), [Installation on Mac](https://blog.teamtreehouse.com/install-node-js-npm-mac),  and [MongoDB](https://www.mongodb.com/download-center?initial=true#community). As well as [Mongo3T](https://robomongo.org) for data inspection and importing using GUI, [Postman](https://www.getpostman.com)for calling REST APIs.

[Import](https://docs.mongodb.com/guides/server/import/) `data/candidates.json` and `data/interviewers.json` in mongo database.

Import the postman collections (`Ki Labs.postman_collection.json`) in Postman to run the microservices.

Change the mongoose URLs in `candidate/app.js` and `interviewer/app.js` to point to your database where you have imported the data.
In three separate terminals, go to all the three folders `candidate/`, `interviewer/`, and `interviews/` and run the following commands one after another to install and run the programs.

```
npm install
npm start
```

After doing this, either run the POST query to the orchestrator to get the time slots of possible interviews between Carl and Philip and Sarah.

## Possible future work:
- Make overlapping time-slots consistent
- Make more graular APIs giving more control to the candiates and inteviewers over their time slots.
- Add authentication
- Add UI


_By Taimoor Alam_