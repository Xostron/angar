const { data: store } = require('@store/index')
const { ctrlADO, ctrlDO, ctrlAO } = require('@tool/command/module_output')
const { getSignalFan, getSignal, getSig } = require('@tool/command/signal')
const { getIdsS } = require('@tool/get/building')
const { isExtralrm } = require('@tool/message/extralrm')

// Кнопка Пуск в ручном режиме (для частотников)
function manFC(bld, section, obj, s, se, m, alarm, acc, data, ban) {
	// Массив ИД секций склада
	const idsS = getIdsS(obj.data.section, bld._id)
	// Переключатель на щите
	const local =
		isExtralrm(bld._id, null, 'local') || idsS.some((idS) => isExtralrm(bld._id, idS, 'local'))
	// Без переключателя выходим
	if (!local) return

	// Активен переключатель на щите
	for (const f of m.fanB) {
		// Значение сигнала "Пуск ВНО в ручном режиме"
		if (!f.ao) continue
		const man = obj?.value?.[f._id]?.man

		// Пуск
		if (man) {
			ctrlADO(f, bld._id, 'on', 100)
		}
		// Стоп
		else {
			ctrlADO(f, bld._id, 'off', 100)
		}
	}
}

module.exports = manFC
