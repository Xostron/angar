const { ctrlB } = require('@tool/command/fan')
const { compareTime } = require('@tool/command/time')

const skip = ['off-off-on', 'off-off-off-add']
const max = 2
// Проверка на включение оттайки
function checkDefrost(fnChange, acc, se, s, stateCooler) {
	// Уже в оттайке или сливе. Пропускаем и + проверка на повторы
	if (skip.includes(stateCooler)){
		// Инициализация счетчика
		if(!acc.state.defrostCount) acc.state.defrostCount = 1
		// TODO Авария при достижение максимума
		if(acc.state.defrostCount > max) 
			console.log(`\n\n\t********** Повторили Оттайку ${acc.state.defrostCount} раз, максимум =${max}`);
		return false
	}
	
	const tmp = se.cooler.clr <= s?.cooler?.defrostOn
	const time =  compareTime(acc.targetDT, s.cooler.defrostWait)
	// Запуск оттайки по температуре и времени
	if ( tmp || time) {
		acc.state.defrostCount += 1
		console.log('\tОттайка по ', tmp ? 'тмп. дт. всасывания': 'времени между интервалами' );
		// acc.targetDT = new Date()
		fnChange(0, 0, 1, 0, 'defrost')
		return true
	}
	// Очистка флага
	if (acc.state.defrostCount) delete acc.state.defrostCount
	return false
}

function change(bdata, idB, sl, f, h, add, code) {
	const { start, s, se, m, accAuto } = bdata
	if (!m?.cold?.cooler?.[0]) return
	const { solenoid, fan, heating } = m?.cold?.cooler?.[0]
	// TODO Управление механизмами
	solenoid.forEach((el) => ctrlB(el, idB, sl ? 'on' : 'off'))
	fan.forEach((el) => ctrlB(el, idB, f ? 'on' : 'off'))
	heating.forEach((el) => ctrlB(el, idB, h ? 'on' : 'off'))
	// Доп состояние слива воды
	accAuto.state ??= {}
	accAuto.state.add = add ? new Date() : false
	// Обновление времени включения состояния
	if (code) accAuto.state[code] = new Date()

	console.log('\tСмена режима ', code, ' : ', sl, f, h, add)
}

module.exports = { change, checkDefrost }
