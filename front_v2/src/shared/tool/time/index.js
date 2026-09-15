/**
 * Пройденное время
 * @param {String||DateTime} doc время
 * @param {number} 0 - стандартный формат hh:mm:ss|mm:ss. 1 - с подписями `${hh}ч ${mm}м`
 * @returns {String} Пройденное время 00:00:00/00:00
 */
function runTime(date, type = 0) {
  try {
    if (typeof date === 'string') date = new Date(date);
    // Пройденное время, с
    const s = (new Date() - date) / 1000;
    return fmtTime(s, type);
  } catch (error) {
    console.error('runTime', error);
    return '';
  }
}

/**
 * Форматировать секунды в 00:00:00 или 00:00
 * @param {number} s время в секундах
 * @param {number} 0 - стандартный формат hh:mm:ss|mm:ss. 1 - с подписями `${hh}ч ${mm}м`
 * @returns {string} 00:00:00 или 00:00
 */
function fmtTime(s, type = 0) {
  // Часы
  const h = Math.trunc(s / 3600);
  // Минуты
  const m = Math.trunc((s % 3600) / 60);
  // секунды
  s = Math.trunc(s % 60);

  const hh = h < 10 ? '0' + h : h;
  const mm = m < 10 ? '0' + m : m;
  const ss = s < 10 ? '0' + s : s;

  if (!type) return h > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  else return `${hh}ч ${mm}м`;
}

export { runTime, fmtTime };
