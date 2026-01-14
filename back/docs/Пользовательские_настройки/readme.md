# store.retain - аккумулятор пользовательских настроек

```
<!-- ИД склада -->
'6800b88d56c6a01c90ecbc5e': {
	<!-- Авторежим -->
	automode: 'cooling',
	<!-- Тип продукта -->
	product: { \_id: '66d0886536e7e1b1ff9e0788', name: 'Лук', code: 'onion' },
	<!-- Вкл/Выкл склад -->
	start: true,
	<!-- Текущая позиция клапанов -->
	valvePosition: {
		'6800bcdd56c6a01c90ecbc90': 0,
		...
	},
	<!-- Калибровочное время клапанов -->
	valve: {
		'6800bcdd56c6a01c90ecbc90': 25000,
		...
	},
	<!-- Авторежим хранения -->
	cooling: { tprdMin: 2, finish: '2026-01-13T12:49:02.909Z' },
	<!-- Дата останова склада -->
	datestop: null,
	<!-- Дата запуска склада -->
	datestart: '2026-01-13T12:49:00.791Z',
	<!-- Авторежим сушки -->
	drying: { acc: 12.83335783564815 },
	<!-- Окуривание -->
	smoking: { work: null, wait: null },
	<!-- Озонатор -->
	ozon: { work: null, wait: null },
	<!-- Режим секции -->
	mode: {
		'6800bdcc05912407c0b68bd3': true,
		...
	},
	<!-- ВНО выведенные из работы: ИД секции: ...ИД ВНО -->
	fan: { '6800bbc056c6a01c90ecbc84': [Object] },
	<!-- Настройки авторежимов -->
	setting: {
		sys: [Object],
		fan: [Object],
		cooling: [Object],
		overVlv: [Object],
		drying: [Object],
		vent: [Object],
		smoking: [Object],
		co2: [Object],
		idle: [Object],
		mois: [Object],
		ozon: [Object]
	},
	<!-- Дата последних изменений настроек -->
	update: { setting: [Object] },
	<!-- Датчики: вывод из работы/коррекция -->
	'6800b96a56c6a01c90ecbc68': { on: true },
	'6800be1105912407c0b68bd6': { on: true },
	'6800be2205912407c0b68bd7': { on: true },
}
```

# obj - глобальные данные процесса, которые создаются/обновляются в каждом цикле в analysis и передаются на web клиент

```
{
	<!-- Конфигурация рамы склада: получаем от админ-панели -->
	data: {
		building: [ [Object] ],
		section: [ [Object], [Object] ],
		module: [ [Object], [Object] ],
		equipment: {
		'673f2400c19393bb9bd7567a': [Object],
		...
		},
		sensor: [ [Object], [Object] ],
		valve: [ [Object], [Object], [Object] ],
		fan: [ [Object] ],
		heating: [ [Object] ],
		solenoid: [],
		cooler: [],
		signal: [ [Object], [Object], [Object] ],
		aggregate: [],
		binding: [ [Object], [Object], [Object] ],
		device: [ [Object], [Object] ],
		weather: {
			\_id: '685a1da802d024a963c9ebd5',
			latitude: 48.75,
			longitude: 44.8125,
			code: 3,
			forecast: [Array],
			forecast_raw: [Object],
			humidity: 43,
			temp: 22.9,
			time: '2025-07-02T15:30',
			update: '2025-07-02T12:37:52.633Z',
			weather: 'Облачно'
		}
	},
	<!-- Заводские настройки авторежимов: от админ-панели -->
	factory: {
	drying: { \_prd: true, carrot: [Object], onion: [Object], potato: [Object] },
	cure: { \_prd: true, onion: [Object], potato: [Object], carrot: [Object] },
	cooling: { \_prd: true, onion: [Object] },
	heat: { \_prd: true, onion: [Object], carrot: [Object], potato: [Object] },
	antibliz: { \_prd: false, mode: [Object] },
	heating: { \_prd: false, on: [Object], hysteresis: [Object] },
	vent: { \_prd: true, onion: [Object], carrot: [Object], potato: [Object] },
	mois: { \_prd: true, onion: [Object], carrot: [Object], potato: [Object] },
	heater: { \_prd: false, mode: [Object], on: [Object] },
	co2: { \_prd: false, ...},
	wetting: { \_prd: true, onion: [Object], carrot: [Object], potato: [Object] },
	accel: { \_prd: false, ... },
	sys: {\_prd: true, cabbage: [Object] },
	idle: { \_prd: false, ... },
	overVlv: { \_prd: false, ... },
	coolerCombi: { \_prd: true, onion: [Object] },
	cooler: { \_prd: true, cabbage: [Object] },
	cold: { \_prd: true, carrot: [Object] },
	fan: { \_prd: true, onion: [Object] },
	smoking: { \_prd: false, ... },
	ozon: { \_prd: false, ... }
	},
	<!-- Значения после анализа: показания и состояния датчиков, испол-ных механизмов -->
	value: {
		<!-- Сырые значения модулей вывода: DO, AO -->
		outputM: {
			'6800b8dc56c6a01c90ecbc63': [
				1, 0, 0, 0, 0, 0,
				0, 0, 0, 0, 0, 0,
				0, 0, 0, 0
				],
			'6800b8c756c6a01c90ecbc61': [Array]
			...
		},
		<!-- Значения управляющего сигнала испол-ных мех-ов (ВНО, клапан, и т.д.) -->
		outputEq: {
			'6800bcdd56c6a01c90ecbc90': [Object],
			'6800bd1056c6a01c90ecbc94': [Object],
			'6800be9d05912407c0b68bdf': [Object],
			'6800bb4256c6a01c90ecbc81': false,
			'6800bcaa56c6a01c90ecbc8e': false,
			'6800be4a05912407c0b68bd9': false,
			'6800bc8d56c6a01c90ecbc8c': false,
			'6800be7305912407c0b68bdb': false,
			'6800bc6a56c6a01c90ecbc8a': false,
			'6800be8705912407c0b68bdd': false,
			'6800bd5556c6a01c90ecbc98': false,
			'69060bba4b672b407cab8094': false,
			'69663ca26415060964c77ccc': false
		},
		<!-- Показания датчиков -->
		'68e387cfa0b5960b24b97491': { raw: null, value: null, state: 'alarm' },
		'6800ba3c56c6a01c90ecbc7e': { raw: 75, value: 75, state: 'on' },
		'6800ba2356c6a01c90ecbc7d': { raw: 85, value: 85, state: 'on' },
		'6800bc5456c6a01c90ecbc89': { raw: 0, value: 0, state: 'on' },
		'6800be3505912407c0b68bd8': { raw: 0, value: 0, state: 'on' },
		'6800bbd556c6a01c90ecbc85': { raw: null, value: null, state: 'alarm' },
		'6800bde605912407c0b68bd4': { raw: 18, value: 18, state: 'on' },
		'6800bbf656c6a01c90ecbc86': { raw: 19, value: 19, state: 'on' },
		'6800bdfb05912407c0b68bd5': { raw: 19, value: 19, state: 'on' },
		'6800bb1356c6a01c90ecbc80': { raw: 22, value: 22, state: 'on' },
		'6800bc1856c6a01c90ecbc87': { raw: 21, value: 21, state: 'on' },
		'6800be1105912407c0b68bd6': { raw: null, value: null, state: 'alarm' },
		'6800bc2f56c6a01c90ecbc88': { raw: 22, value: 22, state: 'on' },
		'6800be2205912407c0b68bd7': { raw: 21, value: 21, state: 'on' },
		'6800b96a56c6a01c90ecbc68': { raw: null, value: null, state: 'alarm' },
		'6800b97c56c6a01c90ecbc69': { raw: null, value: null, state: 'alarm' },
		'6800b88d56c6a01c90ecbc5e': { tweather: [Object], hweather: [Object] },
		<!-- Анализ по датчиком: мин, макс значения -->
		total: {
			<!-- Температура улицы -->
			tout: [Object],
			<!-- Влажность улицы -->
			hout: [Object],
			<!-- мин-макс по датчикам склада -->
			'6800b88d56c6a01c90ecbc5e': [Object],
			'6800bbc056c6a01c90ecbc84': [Object],
			'6800bdcc05912407c0b68bd3': [Object]
		},
		<!-- Расчетная абсолютная влажность улицы, помещения -->
		humAbs: { out: [Object], in: [Object] },
		<!-- Анализ по исполнительным механизмам: ВНО, клапаны, сигналы и т.д. -->
		'6800bb7056c6a01c90ecbc82': true,
		'6800bb9856c6a01c90ecbc83': true,
		'6800bc6a56c6a01c90ecbc8a': { qf: true, off: false, state: 'alarm' },
		'6800bc8d56c6a01c90ecbc8c': { qf: false, off: false, state: 'stop' },
		'6800bcaa56c6a01c90ecbc8e': { qf: false, off: false, state: 'stop', value: 20 },
		'6800bda456c6a01c90ecbc9a': undefined,
		'6800be4a05912407c0b68bd9': { qf: false, off: undefined, state: 'stop' },
		'6800be7305912407c0b68bdb': { qf: false, off: undefined, state: 'stop' },
		'6800be8705912407c0b68bdd': { qf: false, off: undefined, state: 'stop' },
		'6800f12522c9ed05c45fc324': undefined,
		'68c2ceabec93251f602fe0c3': undefined,
		'6932d1883f15172504cf5040': undefined,
		'69663cfce9bedba10c7bf61d': true,
		'6800bcdd56c6a01c90ecbc90': { open: false, close: true, crash: false, val: 0, state: 'cls' },
		'6800bd097f7a99c4bb628e56': false,
		'6800bd1056c6a01c90ecbc94': { open: false, close: true, crash: false, val: 0, state: 'cls' },
		'6800bd327f7a99c4bb628e57': false,
		'6800be9d05912407c0b68bdf': { open: false, close: true, crash: false, val: 0, state: 'cls' },
		'6800bec57f7a99c4bb628e5b': false,
		'6800bb4256c6a01c90ecbc81': { off: undefined, state: 'stop' },
		'69060bba4b672b407cab8094': { beep: {}, state: 'stop' },
		'69663ca26415060964c77ccc': { beep: [Object], state: 'alarm' },
		<!-- Подрежим работы склада: Охлаждение -->
		building: { '6800b88d56c6a01c90ecbc5e': [Object] }
	},
	<!-- Модули вывода: DO, AO (Рама и считанные данные)  -->
	output: {
		<!-- Модуль -->
		'6800b8c756c6a01c90ecbc61': {
			\_id: '6800b8c756c6a01c90ecbc61',
			ip: '192.168.21.125',
			port: 502,
			buildingId: '6800b88d56c6a01c90ecbc5e',
			equipmentId: '66cee314eeb92a11d628b024',
			timeout: 3,
			name: 'МК210-301',
			interface: 'tcp',
			use: 'rw',
			re: [Object],
			wr: [Object],
			value: [Array]
		},
	},
	<!--  -->
	connection: '',
	<!-- Процедуры подготовки к работе в авто -->
	prepareToAuto: {},
	<!-- Пользовательски настройки -->
	retain: {
		<!-- Склад -->
		'6800b88d56c6a01c90ecbc5e': {
			automode: 'cooling',
			product: [Object],
			start: true,
			valvePosition: [Object],
			valve: [Object],
			cooling: [Object],
			datestop: null,
			datestart: '2026-01-14T06:24:57.441Z',
			drying: [Object],
			smoking: [Object],
			ozon: [Object]
			mode: [Object],
			fan: [Object],
			setting: [Object],
			update: [Object],
			'6800b96a56c6a01c90ecbc68': [Object],
			'6800be1105912407c0b68bd6': [Object],
			'6800be2205912407c0b68bd7': [Object],
		}
	},
	<!-- Ошибки склада: не используется -->
	errBuilding: []
}

```

# v - данные передаваемые на WEB клиент

```
{
	<!-- Сырые значения модулей вывода: DO, AO -->
	outputM: {
		<!-- Модуль -->
		'6800b8d056c6a01c90ecbc62': [
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0,
			0, 0, 0, 0
		],
		...
	},
	<!-- Значения управляющего сигнала испол-ных мех-ов (ВНО, клапан, и т.д.) -->
	outputEq: {
		'6800bcdd56c6a01c90ecbc90': { open: false, close: false },
		'6800bd1056c6a01c90ecbc94': { open: false, close: false },
		'6800be9d05912407c0b68bdf': { open: false, close: false },
		'6800bb4256c6a01c90ecbc81': false,
		'6800bcaa56c6a01c90ecbc8e': false,
		'6800be4a05912407c0b68bd9': false,
		'6800bc8d56c6a01c90ecbc8c': false,
		'6800be7305912407c0b68bdb': false,
		'6800bc6a56c6a01c90ecbc8a': false,
		'6800be8705912407c0b68bdd': false,
		'6800bd5556c6a01c90ecbc98': false,
		'69060bba4b672b407cab8094': false,
		'69663ca26415060964c77ccc': false
	},
	<!-- Показания датчиков -->
	'68e387cfa0b5960b24b97491': { raw: 21, value: 21, state: 'on' },
	'6800ba3c56c6a01c90ecbc7e': { raw: 75, value: 75, state: 'on' },
	'6800ba2356c6a01c90ecbc7d': { raw: 85, value: 85, state: 'on' },
	'6800bc5456c6a01c90ecbc89': { raw: 0, value: 0, state: 'on' },
	'6800be3505912407c0b68bd8': { raw: 0, value: 0, state: 'on' },
	'6800bbd556c6a01c90ecbc85': { raw: 20, value: 20, state: 'on' },
	'6800bde605912407c0b68bd4': { raw: 18, value: 18, state: 'on' },
	'6800bbf656c6a01c90ecbc86': { raw: 19, value: 19, state: 'on' },
	'6800bdfb05912407c0b68bd5': { raw: 19, value: 19, state: 'on' },
	'6800bb1356c6a01c90ecbc80': { raw: 22, value: 22, state: 'on' },
	'6800bc1856c6a01c90ecbc87': { raw: 21, value: 21, state: 'on' },
	'6800be1105912407c0b68bd6': { raw: 20, value: 20, state: 'on' },
	'6800bc2f56c6a01c90ecbc88': { raw: 22, value: 22, state: 'on' },
	'6800be2205912407c0b68bd7': { raw: 21, value: 21, state: 'on' },
	'6800b96a56c6a01c90ecbc68': { raw: 20, value: 20, state: 'on' },
	'6800b97c56c6a01c90ecbc69': { raw: null, value: null, state: 'alarm' },
	<!-- Прогноз погоды -->
	'6800b88d56c6a01c90ecbc5e': {
		tweather: { raw: 22.9, value: 22.9, state: 'alarm' },
		hweather: { raw: 43, value: 43, state: 'alarm' }
	},
	<!-- мин макс показания датчиков -->
	total: {},
	<!-- Расчетная абсолютная влажность улицы, помещения -->
	humAbs: { },
	<!-- Пользовательские настройки -->
	retain: { },
	<!-- Заводские настройки -->
	factory: { },
	time: 2026-01-14T07:32:44.753Z,
	errBuilding: [],
	<!-- Настройки: Расчетные коэффициенты  -->
	coef: {
		'6800b88d56c6a01c90ecbc5e': { mois: [Object], co2: [Object], sys: [Object], fan: [Object] }
	}
}

```

```

```
