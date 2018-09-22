// --------------------------------------
const express = require('express');
const format = require('util').format;
const bodyParser = require('body-parser');
const cors = require('cors');
const mongo = require('mongodb');

// --------------------------------------
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// --------------------------------------

// --------------------------------------
// Housekeeping GET
// --------------------------------------
app.get('/tictoc', (req, res) => {
  res.send('Run housekeeping from here...');
});

// --------------------------------------
// Mongo Setup
// --------------------------------------
const uri = 'mongodb://swott:tempPass38@ds157901.mlab.com:57901/swottbase';

let connection;
mongo.MongoClient.connect(uri, { useNewUrlParser: true }, (err, mongoconnect) => {
  if (err) console.log('Error connecting to DB.');
  console.log('DB connected');
  connection = mongoconnect.db('swottbase');
});


// --------------------------------------
// Main API
// --------------------------------------
app.post('/:rubric/:call', (req, res) => {
  const rubric = req.params.rubric;
  const call = req.params.call;
  const input = req.body;

  const dynamodule = require(`./rubrics/${rubric}`);
  dynamodule[call](
    {
      input,
      mongo,
      connection
    },
    (data) => {
      res.json({
        data,
        input,
      });
    },
  );
});

// --------------------------------------
app.listen(8080, () => {
  console.log('Listening on port 8080');
});