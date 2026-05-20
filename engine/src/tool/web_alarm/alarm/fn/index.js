const { data: store } = require('@store')

// Сбор данных - Данные отправляемые в логирование
function history(r, buildings) {
	for (const { _id: idB } of buildings) {
		// Критические аварии
		r.history.critical = r.history.critical.concat(...r.signal[idB].filter((el) => el.count))
		// Информационные сообщения
		r.history.event = r.history.event.concat(...r.signal[idB].filter((el) => !el.count))
		// Сообщения achieve
		r.history.achieve = r.history.achieve.concat(...r.achieve[idB])
	}
}

// Данные отправляемы в мониторинг: критические аварии
function critical(r) {
	for (const bld in r.signal) {
		// Критические аварии кроме module (Модуль не в сети)
		const t = r.signal[bld].filter((el) => el.count && el.code !== 'module')
		// Замена нескольких сообщений не в сети на одно сообщение (Пропала связь)
		const m = r.signal[bld].filter((el) => el.code === 'module')
		if (m.length > 1) {
			const o = {
				...m[0],
				title: '',
				msg: 'Обратитесь в сервисный центр (пропала связь с модулем)',
			}
			t.push(o)
		} else {
			m.length ? t.push(m[0]) : null
		}
		r.monit.critical[bld] = t
	}
}

// Счетчик аварий на карточке склада (стр. Склады)
function count(r) {
	// По складу
	for (const bId in r.signal) {
		// По всем аварийным сообщениям
		r.count[bId] ??= 0
		r?.signal?.[bId]?.forEach((o) => {
			if (o.count) r.count[bId] += 1
		})
	}
}

module.exports = { history, critical, count }
