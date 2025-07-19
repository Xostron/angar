const http = require('http')
const { Server } = require('socket.io')
const app = require('@root/app')


/**
 * Create HTTP server.
 */
const server = http.createServer(app)
const io = new Server(server, {
        cors: process.env.ALLOWED_ORIGIN,
        serveClient: false,
    })


module.exports = {server, io}