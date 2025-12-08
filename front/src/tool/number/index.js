function validNumber(val, min, max) {
	// получение value с защитой от пробела
	let r = val.trim();

	// защита от минуса при min >= 0 (удаляем минус из любого места)
	if (min >= 0) {
		r = r.replace(/-/g, ''); // Удаляем все минусы
	} else {
		// Если допускается минус, разрешаем только в начале
		// Удаляем все минусы кроме первого символа
		if (r.length > 1) {
			const firstChar = r[0];
			const rest = r.slice(1).replace(/-/g, ''); // Удаляем минусы из остальной части
			r = firstChar + rest;
		}
	}

	// защита от ввода букв и символов (кроме . и -)
	// Разрешаем только цифры, точку и минус в начале
	const validChars = /^-?[\d.]*$/;
	if (!validChars.test(r)) {
		r = r.slice(0, -1);
	}

	// защита от вставки текста
	if (r.length > 0 && isNaN(r) && r !== '-' && r !== '.') r = '';

	// защита от вставки нулей: не допускаем "0X" где X - цифра (кроме "0.")
	// "0" → разрешено
	// "0." → разрешено
	// "01", "02", ... "09" → запрещено
	// "-0" → разрешено
	// "-01", "-02" → запрещено
	if (r.length >= 2) {
		// Проверяем паттерн: начинается с 0 (или -0), затем идет цифра (не точка)
		if (/^-?0\d/.test(r)) {
			r = r.slice(0, -1); // Удаляем последний введенный символ
		}
	}

	// Защита от превышения максимума
	// Если введенное число уже больше максимума, не добавляем новый символ
	if (max !== undefined && max !== null) {
		const numValue = parseFloat(r);
		if (!isNaN(numValue) && numValue > max) {
			r = r.slice(0, -1); // Удаляем последний введенный символ
		}
	}

	return r;
}

/**
 * toFixed без округления
 * @param {*} v Число
 * @param {*} precision Точность - кол-во цифр после точки
 * @returns
 */
function decimal(v, precision) {
	const idx = v.toString().indexOf('.');
	if (idx === null) return v;

	let base = v.toString().substring(0, idx);
	let part = idx > 0 ? v.toString().substring(idx) : '';
	if (part.length > precision) {
		part = part.substring(0, precision + 1);
		return base + part;
	}
	return v;
}

export { validNumber, decimal };
