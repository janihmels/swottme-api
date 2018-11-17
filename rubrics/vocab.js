// -----------------------------------------------------
// -----------------------------------------------------
const nItems = 10;

const getTen = (parameters,cb) => {
	var collection = parameters.connection.collection('cardpool');
	const input = parameters.input;

	getStats(parameters, stats => {
		getTenIterate(parameters, data => {
			cb({...data, stats});
		});
	});
}

const getTenIterate = (parameters,cb) => {
	var collection = parameters.connection.collection('cardpool');
	const input = parameters.input;

	getPool(parameters, pool => {
		getRipe(parameters, docs => {
			const nUser = docs.length;
			if(nUser === nItems) {
				cb({ten: docs, pool});
				return;
			} else {
				addNewItems(parameters, nItems - nUser, () => {
					getTenIterate(parameters, cb);
				});	
			}
		});	
	});
}

// -----------------------------------------------------
// -----------------------------------------------------
function getRipe(parameters,cb) {
	const msPerDay=24*60*60*1000;
	var collection=parameters.connection.collection('vocab');
	var input=parameters.input;
	var now=Date.now();

	const query={
		learnerid:input.learnerid,
		"srs.nextDisplay": {
			$lte: now
		}
	};

	collection.update(
		query,
		{
			$set : {
				"srs.reviewed" : false
			}
		},
		{
			multi:true
		}
	);

	collection.find(query,{})
		.limit(nItems)
		.toArray(function (err, documents) {
			cb(documents);
		});
}

// -----------------------------------------------------
// -----------------------------------------------------
const addNewItems = (parameters, limit, cb) => {
	const collectionPool = parameters.connection.collection('cardpool');
	const collectionVocab = parameters.connection.collection('vocab');
	const { learnerid } = parameters.input;
	const now = Date.now();
	
	let inUse = [];

	collectionVocab
		.find({ learnerid }, {}).toArray(
		(err, items) => {
			inUse = items.map(
				x => parameters.mongo.ObjectID(x.poolid)
			);
			collectionPool
				.find({ _id: {$nin: inUse} })
				.limit(limit)
				.toArray(
					(err, items) => {
						const now = Date.now();
						const insertItems = items.map( 
							x => {
								let newx = { ...x };
								newx.poolid = newx._id;
								delete newx._id;
								return {
									...newx, learnerid,
									srs: {
										reviewed: false, nReps: 0,
										eFactor: 2.5, interval: 0,
										lastDisplay: now, nextDisplay: now
									}
								}
							}
						);
						collectionVocab.insertMany(insertItems, () => {
							cb();
						})
					}
				);
		}
	);


	
}

// -----------------------------------------------------
// -----------------------------------------------------
const getPool = (parameters, cb) => {
	var collection = parameters.connection.collection('cardpool');
	collection.find({})
		.project({chinese:1})
		.toArray(
			(errOuter, pool) => {
				cb(pool);
			}
		);
}

// -----------------------------------------------------
// -----------------------------------------------------
const getStats = (parameters, cb) => {
	var collection=parameters.connection.collection('vocab');
	var input=parameters.input;
	var now=Date.now();

	const querySRS={
		learnerid:input.learnerid,
		"srs.nextDisplay": {
			$lte: now
		}
	};
	const queryAll={
		learnerid:input.learnerid
	};

	collection.count(querySRS,function(error,ripe){
		collection.count(queryAll,function(error,seen){
			const mastered = seen - ripe;
			cb({ ripe, seen, mastered });
		});
	});
}

// -----------------------------------------------------
// -----------------------------------------------------
const report = (parameters,cb) => {

	const msPerDay=24*60*60*1000;
	const collection = parameters.connection.collection('vocab');
	const input = parameters.input;
	
	const vid 	= input.vid;
	const score = parseInt(input.score);

	const query = { "_id" : new parameters.mongo.ObjectID(vid) };
	
	collection.findOne(
		query,
		{},
		(err, vocab) => {

			if(vocab.srs.reviewed) {
				cb({message:'Already reviewed'});
				return null;
			}

			let e=parseFloat(vocab.srs.eFactor);
			let n=parseInt(vocab.srs.nReps);
			let interval=parseInt(vocab.srs.interval);

			let dE=(0.1-(5-score)*(0.08+(5-score)*0.02));
			let ePrimed= (e+dE)>1.3 ? e+dE : 1.3;
			let nPrimed=n+1;

			let intervalPrimed=null;
			switch(nPrimed) {
				case 1:
					intervalPrimed=1;
					break;
				case 2:
					intervalPrimed=6;
					break;
				default:
					intervalPrimed=Math.round(interval*ePrimed);
			}

			if(score<3) {
				nPrimed=1;
				intervalPrimed=1;
			}

			const now = Date.now();
			const nextDisplay = now+msPerDay*intervalPrimed;
			const srs = {
					reviewed: true,
					nReps: nPrimed,
					eFactor: ePrimed,
					interval: intervalPrimed,
					lastDisplay: now,
					nextDisplay: nextDisplay
			};

			collection.update(
				query,
				{ $set : { srs : srs } }
			);

			cb({srs:srs});
		}
	);
}


// -----------------------------------------------------
// -----------------------------------------------------
const get = (parameters, cb) => {
	var collection = parameters.connection.collection('cardpool');

	let { index, limit } = parameters.input;
	index = parseInt(index);
	limit = parseInt(limit);
	const from = index*limit; 

	collection.count({},function(err,ncards){
		collection.find({},{})
			.skip(from).limit(limit)
			.toArray(function (err, cards) {
				cb({cards, ncards});
			});
	});

}

// -----------------------------------------------------
// -----------------------------------------------------
const getUserCards = (parameters,cb) => {
	const msPerDay=24*60*60*1000;
	var collection=parameters.connection.collection('vocab');
	var input=parameters.input;
	var servertime=Date.now();

	const query={
		learnerid:input.learnerid
	};

	collection.find(query,{})
		.toArray(function (err, cards) {
			cb({cards, servertime});
		});
}

// -----------------------------------------------------
// -----------------------------------------------------
exports.report = report;
exports.getTen = getTen; 
exports.get = get;
exports.getUserCards = getUserCards;