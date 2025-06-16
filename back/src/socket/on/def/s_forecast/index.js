const forecast = require('@root/client/forecast')

module.exports = function sForecast(io, socket) {
	socket.on('s_forecast', (arg, callback) => {
		console.log(552, 's_forecast', arg)
		forecast(arg.build)
			.then((data) => callback(data))
			.catch(console.log)
	})
}
