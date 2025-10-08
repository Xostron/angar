// Настройки uri
const apiPort = '4000';
let uri = window.location.hostname;

if (process.env.NODE_ENV === 'development') {
	console.log('Development');
	const test = '192.168.21.41';
	uri = test;
	console.log('В режиме development, uri: ' + uri);
}

module.exports = {
	uri,
	socket: uri + ':' + apiPort,
	api: 'http://'+uri + ':' + apiPort + '/api',
};
