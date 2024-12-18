const writeRTU = require('./rtu');
const writeTCP = require('./tcp');
const { data: store, timeout, isErrM } = require('@store');

/**
 * Записать данные в модули
 * @param {*} obj
 * @returns
 */
async function write(obj) {
	try {
		if (!obj) return null;
		const ok = {};
		for (const i in obj) {
			if (!timeout(obj[i].buildingId, obj[i]._id, obj[i].ip, obj[i])) {
				continue;
			}

			let v;
			switch (obj[i].interface) {
				case 'rtu':
					v = await writeRTU(obj[i].ip, obj[i].port, obj[i]);
					break;
				case 'tcp':
					v = await writeTCP(obj[i].ip, obj[i].port, obj[i]);
					break;
			}
			await pause(100);
			const k = obj[i].name + ' Порт ' + obj[i].port;
			ok[k] = v;
		}
		return ok;
	} catch (error) {
		console.log(error);
		throw Error('Запись: связь RTU/TCP потеряна', error);
	}
}

// Пауза
function pause(n) {
	return new Promise((res) => setTimeout(res, n));
}

module.exports = write;
