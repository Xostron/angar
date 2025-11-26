// Максимальное кол-во вентиляторов при принудительном включении
// (внутренняя вентиляция, удаление СО2)
function fnLimit(fanFC, aCmd) {
	// Нет принудительного вкл
	if (!aCmd?.force) return null
	// Кол-во ВНО = 0 || undefined || null
	if (!aCmd?.max) return -1
	// Настройка "Макс. кол-во ВНО" > 0
	return fanFC ? aCmd?.max - 1 : max
}

module.exports = { fnLimit }
