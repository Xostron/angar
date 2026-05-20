const { data: store } = require('@store')

// Если аккумулятор retain был пуст, то инициализируем его: записываем авторежим склада и продукт
async function initRetain(equip) {
	const { building, product } = equip
	const onion = product?.find((el) => el.code == 'onion')
	// Инициализация по-умолчанию (авторежим, продукт)
	if (!building) return
	for (const bld of building) {
		store.retain ??= {}
		store.retain[bld._id] ??= {}
		// Авторежим
		store.retain[bld._id].automode ??= 'cooling'
		// Продукт
		store.retain[bld._id].product ??= onion
	}
}

module.exports = initRetain
