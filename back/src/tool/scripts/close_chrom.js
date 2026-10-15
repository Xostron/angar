const { execProm } = require('./fn');

function close_chrom() {
	return new Promise((resolve, reject) => {
		if (process.platform !== 'linux') return;
		const cmd = `pkill chromium || true`;

		execProm(cmd, 'Закрытие Браузера')
			.then((_) => resolve())
			.catch(reject);
	});
}

module.exports = close_chrom;
