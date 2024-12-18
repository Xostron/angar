// Таблица давления и плотности насыщенного водяного пара при различных температурах
// Для расчета абсолютной влажности
// Абс влаж = Отн. влаж % * k[из таблицы по Temp] / 100
const data = {
	'-30': 0.33,
	'-29': 0.37,
	'-28': 0.41,
	'-27': 0.46,
	'-26': 0.51,
	'-25': 0.55,
	'-24': 0.6,
	'-23': 0.66,
	'-22': 0.73,
	'-21': 0.8,
	'-20': 0.88,
	'-19': 0.96,
	'-18': 1.05,
	'-17': 1.15,
	'-16': 1.27,
	'-15': 1.38,
	'-14': 1.51,
	'-13': 1.65,
	'-12': 1.8,
	'-11': 1.96,
	'-10': 2.14,
	'-9': 2.33,
	'-8': 2.54,
	'-7': 2.76,
	'-6': 2.99,
	'-5': 3.24,
	'-4': 3.51,
	'-3': 3.81,
	'-2': 4.13,
	'-1': 4.47,
	0: 4.84,
	1: 5.22,
	2: 5.6,
	3: 5.98,
	4: 6.4,
	5: 6.84,
	6: 7.3,
	7: 7.8,
	8: 8.3,
	9: 8.8,
	10: 9.4,
	11: 10,
	12: 10.7,
	13: 11.4,
	14: 12.1,
	15: 12.8,
	16: 13.6,
	17: 14.5,
	18: 15.4,
	19: 16.3,
	20: 17.3,
	21: 18.3,
	22: 19.4,
	23: 20.6,
	24: 21.8,
	25: 23,
	26: 24.4,
	27: 25.8,
	28: 27.2,
	29: 28.7,
	30: 30.3,
	31: 32.1,
	32: 33.9,
	33: 35.7,
	34: 37.6,
	35: 39.6,
	36: 41.8,
	37: 44,
	38: 46.3,
	39: 48.7,
	40: 51.2,
	45: 65.4,
	50: 83.0,
	55: 104.3,
	60: 130,
	65: 161,
	70: 198,
	75: 242,
	80: 293,
	85: 354,
	90: 424,
	95: 505,
	100: 598,
}
module.exports = data
