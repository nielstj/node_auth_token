// jscs:disable

const bcrypt = require('bcryptjs');
const knex = require('../db/connection');
const localAuth = require('./local');

function createUser(req) {
	const salt = bcrypt.genSaltSync();
	const hash = bcrypt.hashSync(req.body.password, salt);
	return knex('users')
	.insert({
		username: req.body.username,
		password: hash
	})
	.returning('*');
}

function getUser(username) {
	return knex('users').where({username}).first();
}

function comparePass(userPassword, dbPassword) {
	return bcrypt.compareSync(userPassword, dbPassword);
	// if(!bool) throw new Error('bad pass silly money');
	// else  return true
}

function ensureAuthenticated(req, res, next) {
  if (!(req.headers && req.headers.authorization)) {
    return res.status(400).json({
      status: 'Please log in'
    });
  }
  // decode the token
  var header = req.headers.authorization.split(' ');
  var token = header[1];
  localAuth.decodeToken(token, (err, payload) => {

    if (err) {
      return res.status(401).json({
        status: 'Token has expired'
      });
    } else {
      // check if the user still exists in the db
      return knex('users').where({id: parseInt(payload.sub)}).first()
      .then((user) => {
        next();
      })
      .catch((err) => {
        res.status(500).json({
          status: 'error'
        });
      });
    }
  });
}

module.exports = {
	createUser,
	getUser,
	comparePass,
	ensureAuthenticated
};
