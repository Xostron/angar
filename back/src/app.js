const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const compression = require('compression')
const logger = require('morgan')
const cors = require('cors')
const passport = require('passport')
const passportJwt = require('passport-jwt')
const JwtStrategy = passportJwt.Strategy
const ExtractJwt = passportJwt.ExtractJwt

const jwtDecodeOptions = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey: process.env.JWT_ACCESS_SECRET,
	// issuer: 'accounts.examplesoft.com',
	// audience: 'yoursite.net',
}

passport.use(
	new JwtStrategy(jwtDecodeOptions, (payload, done) => {
		return done(null, payload.data)
	})
)

var app = express()
// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// Отключение CORS
app.use(
	cors({
		credentials: true,
		origin: function (origin, callback) {
			return callback(null, true)
		},
	})
)
app.use(logger('dev'))
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))


module.exports = app
