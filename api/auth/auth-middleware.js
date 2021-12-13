
const express = require('express')
const User = require('../users/users-model')

/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
const restricted=(req, res, next)=> {
  if ( req.session.user) {
    next()
  } else {
    next({ status: 401, message: 'you shall not pass' })
  }
}


/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
 async function checkUsernameFree(req, res, next) {
  User.findBy(req.body)
    .then(response => {
      if (response.length) {
        res.status(422).json({ message: 'Username taken' })
      }
      else {
        next()
      }
    })
    .catch(err => {
      res.status(500).json({ message: err.message })
    })
}

/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
async function checkUsernameExists(req, res, next) {
  try {
    const rows = await User.findBy({ username: req.body.username })
    if (rows.length) {
      req.userData = rows[0]
      next()
    } else {
      res.status(401).json("Invalid Credentials")
    }
  } catch (e) {
    res.status(500).json(`Server error: ${e.message}`)
  }
}
/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req, res, next) {
  try {
    if(!req.body.password || req.body.password.length <= 3) {
      res.status(422).json({
        message: 'Password must be longer than 3 chars'
      });
    } else {
      next();
    }
  } catch(err) {
    res.status(500).json(`Server error: ${err}`);
  }
}


// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}