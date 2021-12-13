// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!
const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const User = require('../users/users-model')
const { checkUsernameFree, checkUsernameExists, checkPasswordLength } = require('./auth-middleware')
const session = require("express-session");




router.post('/register', checkUsernameFree, checkPasswordLength, (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, 10)
  User.add({ username: req.body.username, password: hash })
    .then(response => {
      res.status(201).json(response)
    })
    .catch(err => {
      res.status(422).json({ message: 'username taken' })
    })
})

//   const credentials = req.body;
//   const hash = bcrypt.hashSync(credentials.password, 14);
//   credentials.password = hash;
//   model.add(credentials)
//     .then(success => {
//       res.status(200).json(success);
//     })
//     .catch(error => {
//       res.status(500).json(`Server error ${error}`);
//     })
// });



/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */

  router.post('/login', checkUsernameExists, (req, res) => {
    console.log('login post route')
    try {
      const verified = bcrypt.compareSync(req.body.password, req.userData.password)
      if (verified) {
        req.session.user = req.userData
        res.status(200).json({ message: `Welcome ${req.userData.username}` })
        // res.json(`Welcome back ${req.userData.username}`)
        //res.json(`Welcome back ${req.session.user.username}`)
      } else {
        res.status(401).json({ message: "Invalid Credentials" })
      }
    } catch (e) {
      res.status(500).json({ message: "Invalid Credentials" })
    }
  })
/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */


/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */
  router.get('/logout', (req, res) => {
   
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          res.json(`Can't log out:${err.message}`)//
        } else {
          res.status(200).json({ message: 'no session' })//no session
        }
      })
    } else {
      res.status(200).json({ message: "no seesion" }) //logged out
    }
  
  })
  
  


  module.exports = router
// Don't forget to add the router to the `exports` object so it can be required in other modules
