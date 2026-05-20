/**
 * Рекурсивная очистка аккумулятора склада store.acc[idB]
 * 1. Сброс ключ-значение _alarm (флаги _alarm используются в extralrm для фиксации срабатывания аварии)
 * 2. Сброс ключ-объектов, ключи перечислены в массиве arr (некоторые аккумуляторы, необходимо полностью сбрасывать
 * при сбросе аварии, чтобы обнулить данные зафиксировавшие аварию, и начать слежение заново)
 *
 * @param {object} acc Аккумулятор склада store.acc[idB] (мутирование)
 * @param {string[]} arr Список ключей-объектов которые необходимо обнулить при наличии в нем аварии
 * @param {string} pKey Ключ вложенного аккумулятора родителя (для выполнения п.2)
 * @param {object} pAcc Аккумулятор родитель, acc (вложенный) текущий объект аккумулятор (для выполнения п.2)
 */
function clearAcc(acc, arr, pKey, pAcc) {
	console.log('ENTER')
	// Проверка текущий объект из списка arr? если ключ _alarm=true у данного
	// объекта -> обнуляем данный объект, иначе не трогаем
	if (pKey && arr.includes(pKey)) {
		if (acc._alarm === true) {
			console.log('обнуляем данный объект', pKey, 'так как acc._alarm=true', pAcc[pKey])
			delete pAcc[pKey]
		} else {
			console.log('Не трогаем данный объект', pKey, 'так как acc._alarm=false')
		}
		return
	}
	// Текущий объект не из списка arr
	// По ключам аккумулятора
	for (const key in acc) {
		// Ключ - значение
		if (typeof acc[key] !== 'object') {
			console.log('Ключ-значение', key)
			if (key === '_alarm') console.log('\t найден _alarm', acc[key])
			key === '_alarm' ? (acc[key] = false) : null
			continue
		}
		console.log('Ключ-объект', key)
		// Ключ - объект
		clearAcc(acc[key], arr, key, acc)
	}
}

const mock = {
	q1: 1,
	id1: {
		q2: 2,
		q3: 3,
		_alarm: false,
	},
	id2: {
		q4: 4,
		id2_1: {
			_alarm: true,
			id2_1_1: {
				q: 1,
				id2_1_1_3: {
					_alarm: true,
					stableVno: {
						w: 1,
						r: 2,
						_alarm: true,
					},
				},
			},
		},
		_alarm: true,
	},
	alarm: {
		t: 5,
		_alarm: true,
	},
	finish: true,
	www: {
		tt: 12,
		_alarm: true,
	},
	vvv: {
		t: 10,
		_alarm: false,
	},
	zzz: {
		X: 1,
		Y: 2,
		Z: 3,
		_alarm: undefined,
	},
}

console.log('INPUT', mock)
clearAcc(mock, ['stableVno', 'www', 'vvv', 'zzz'])
console.log('OUTPUT', JSON.stringify(mock, null, ' '))
