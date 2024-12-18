module.exports = function info(io, socket) {
	socket.on('hello', (arg, callback) => {
		console.log('hello+', arg); // "world"
		const obj = {
			b: [1, 2, 3, 4],
			c: 'test string',
			d: 32432.99,
		};
		callback(obj, 'ok');
	});
};
