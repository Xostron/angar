const { clearAchieve } = require('@tool/message/achieve')
const { data: store } = require('@store')
/**
 * @description Обычный склад: Очистка аккумулятора, когда выключен склад или все секции не в авто
 * @param {object} accAuto Аккумулятор
 * @param {boolean} isAllSectOff true - Все секции выключены/руч
 * @param {boolean} start Склад включен
 * @returns
 */
function clearAcc(accAuto, isAllSectOff, start) {
	if (isAllSectOff) return fnClear()
	if (!start) return fnClear()
	function fnClear() {
		if (!Object.keys(accAuto).length) return
		for (const key in accAuto) {
			if (['cold', 'datestop', 'clearAchieve'].includes(key)) continue
			delete accAuto[key]
		}
	}
}

function clear(bld, obj, accAuto, isAllSectOff, start) {
	clearAcc(accAuto, isAllSectOff, start)
	clearAchieve(bld, obj, accAuto, isAllSectOff, start)
}
module.exports = clear
