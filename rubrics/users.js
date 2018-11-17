const mail = require('./mail.js');

// -----------------------------------------------------
// -----------------------------------------------------
function signin(parameters,cb) {
	const collection=parameters.connection.collection('users');
	const { email, password } = parameters.input;
	collection.findOne({ email, password }, {}, 
		(err, res) => {
			if(err) {
				cb({err}); 
				return; 
			}
			cb(res);
		} 
	);

}
// -----------------------------------------------------
function signup(parameters,cb) {

	const collection=parameters.connection.collection('users');
	const input=parameters.input;
	
	const { first, last, email, phone, password } = input;
	const user = { first, last, email, phone, password };
	
	collection.insert(user, 
		(err, res) => {
			if(err) {
				cb({err}); 
				return; 
			}
			const id = res.insertedIds[0];
			cb({id});
		}
	);
}

// -----------------------------------------------------
// -----------------------------------------------------
function requestpass(parameters,cb) {
	const collection = parameters.connection.collection('users');
	const { email } = parameters.input;

	collection.findOne({ email }, {}, 
		(err, res) => {
			if(err) {
				cb({err}); 
				return; 
			}
			if(res===null) {
				cb({code: null});
				return;
			}
			mail.getSecurityCode( { email }, code => {
				cb(code);
			});		
		} 
	);
	
}

// -----------------------------------------------------
// -----------------------------------------------------
function updatepass(parameters,cb) {
	const collection = parameters.connection.collection('users');
	const { password, email } = parameters.input;
	
	collection.update(
		{ email }, 
		{ $set: { password } }
	);
	cb();
}

// -----------------------------------------------------
// -----------------------------------------------------
function get(parameters,cb) {
	const collection = parameters.connection.collection('users');
	let { index, limit } = parameters.input;
	index = parseInt(index);
	limit = parseInt(limit);
	const from = index*limit; 

	collection.count({},function(err,nusers){
		collection.find({},{})
			.skip(from).limit(limit)
			.toArray(function (err, users) {
				cb({users, nusers});
			});
	});
}

exports.signup=signup;
exports.signin=signin;
exports.requestpass=requestpass;
exports.updatepass=updatepass;
exports.get=get;