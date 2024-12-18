// Задержка при запуске питания
// После отключения 30 минут можно не реагировать продолжаем как обычно
// Далее 30 минут ожидания
// true - Можно продолжать
// false - Останавливаем работу
const { compareTime } = require('@tool/command/time')
const { data: store } = require('@store')

function supply(state, idB, retain) {
	// Время ожидания между запуском и отключением питания
	// const time = 10000;
	const time = 30 * 60000
	// Получаем время последнего запуска и выключения
	const doc = retain[idB]?.supply ?? {};
	store.supply[idB] = doc;
	console.log('Supply: state', state, 'doc', doc);
	if(!state) return false

	// Питание отключено
	if (!state?.on) {
		// Питание было отключено в первый раз. Обновляем время
		if (!doc.off) {
			// Обновляем время + записать в retain
			doc.off = new Date();
			doc.on = null;
		}
		console.log(
			'Питание отключено в',
			doc?.off?.toLocaleString(),
			'Проверка:',
			compareTime(new Date(doc.off), time)
		)
		// Проверка времени
		return false;
	}

	// Питание в норме
	// console.log('Питание в норме c ', doc.on?.toLocaleString());
	// Не получали сигнал о выключении
	if (!doc.off) return true;
	// Обновляем время включения
	if (!doc.on) doc.on = new Date();
	// Питания дали раньше дельты. или вышло время ожидания
	if (!compareTime(new Date(doc.off), time) || compareTime(new Date(doc.on), time)) {
		console.log('Питание дали раньше ')
		// Обнуляю время отключения
		doc.off = null;
		return true;
	}
	console.log('Питание дали в ', doc.on, ' ожидаем проверку ', compareTime(new Date(doc.on), time))
	return false
}

module.exports = supply;
