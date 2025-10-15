function fnWeb(result) {
	console.log(4101, store.web)
	for (const key in store.web) {
		for (const idB in store.web[key]) {
			for (const idS in store.web[key][idB]) {
				result[idB] = { ...result[idB] }
			}
		}
		store.web[key]
	}
	// Очистить аккумулятор
	store.web = {}
}

// 8. Режимы секции
// 9. Авторежимы склада
// 10. Вкл/выкл склад
// 11. Продукт
// 12. Датчики
// 13. Настройки

module.exports = fnWeb
