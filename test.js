const mongo = require('mongodb');

const uri='mongodb://jan:lassopasso@ds141313-a0.mlab.com:41313,ds141313-a1.mlab.com:41313/tookeebase?replicaSet=rs-ds141313';
let connection;
mongo.MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
	if(err) console.log("Error connecting to DB.");
	console.log("DB connected");
	const db = client.db('tookeebase');
	
	//connection=mongoconnect;
	const collectionCoaches=db.collection('coaches');
	collectionCoaches.find( {}, {} )
	.toArray( (error, coaches) => {
		console.log(coaches);
	});
});
