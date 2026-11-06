import { useEffect, useMemo, useState } from 'react'
import Btn from '@cmp/fields/btn'
import useWarn from '@store/warn'
import useEquipStore from '@store/equipment'
import { useTimeStore } from '@store/time'
import { posZoneLabel } from '@tool/datetime'
import { get, post } from '@tool/api/service'
import { notification } from '@cmp/notification'

export default function Pos() {
	const warn = useWarn((s) => s.warn)
	const clear = useWarn((s) => s.clear)
	// Зона POS: из рамы оборудования (apiInfo), до первой рамы — из стора времени
	const apiInfo = useEquipStore((s) => s.apiInfo)
	const storeZone = useTimeStore((s) => s.timezone)
	const current = apiInfo?.timezone || storeZone || ''
	// Список зон и выбранное в списке значение
	const [zones, setZones] = useState([])
	const [zone, setZone] = useState('')
	const [zoneLoading, setZoneLoading] = useState(false)

	// Группировка зон по региону (Europe, Asia, ...) для optgroup
	const zoneGroups = useMemo(() => {
		const groups = new Map()
		zones.forEach((el) => {
			const region = el.includes('/') ? el.split('/')[0] : 'Прочее'
			if (!groups.has(region)) groups.set(region, [])
			groups.get(region).push(el)
		})
		return [...groups.entries()]
	}, [zones])

	// Список доступных поясов + текущий пояс POS
	function fetchZones() {
		setZoneLoading(true)
		get('timezone')
			.then((o) => {
				const list = Array.isArray(o?.zones) ? o.zones : []
				const cur = o?.current || current
				setZones(list)
				setZone(list.includes(cur) ? cur : '')
			})
			.catch((e) => {
				notification.error(
					e.message || 'Ошибка получения списка часовых поясов',
					{ errorId: e.id },
				)
			})
			.finally(() => setZoneLoading(false))
	}

	// Установка выбранного пояса на POS
	function onSetZone() {
		if (!zone) {
			notification.warning('Выберите часовой пояс')
			return
		}
		if (zone === current) {
			notification.warning('Этот часовой пояс уже установлен')
			return
		}
		setZoneLoading(true)
		post('timezone', { zone })
			.then((o) => {
				const tz = o?.zone || zone
				const offset = typeof o?.offset === 'number' ? o.offset : undefined
				// Не ждём следующую раму оборудования — сразу обновляем зону POS в сторах
				useEquipStore.setState((s) => ({
					apiInfo:
						offset === undefined
							? { ...s.apiInfo, timezone: tz }
							: { ...s.apiInfo, timezone: tz, offset },
				}))
				useTimeStore.setState(
					offset === undefined ? { timezone: tz } : { timezone: tz, offset },
				)
				notification.success(
					`Часовой пояс установлен: ${posZoneLabel(tz, offset ?? apiInfo?.offset)}`,
				)
			})
			.catch((e) => {
				notification.error(
					e.data?.error || e.message || 'Ошибка установки часового пояса',
					{ errorId: e.id },
				)
			})
			.finally(() => setZoneLoading(false))
	}

	// Список поясов нужен сразу при открытии раздела
	useEffect(() => {
		fetchZones()
	}, [])

	return (
		<>
			<div className='page-service-row'>
				{/* <Btn title='AutoLogin On' onClick={() => onAL(true, warn, clear)} /> */}
				{/* <Btn title='AutoLogin Off' onClick={() => onAL(false, warn, clear)} /> */}
				<Btn title='Презагрузка PC' onClick={() => onReboot()} />
				<Btn title='Выключение PC' onClick={() => onShutdown()} />
			</div>
			<div className='page-service-row'>
				<Btn title='Установить дату и время ' onClick={() => onSetDateTime(warn, clear)} />
				<Btn title='Синхронизировать дату и время (Интернет!)' onClick={() => syncTime()} />
			</div>
			<span style={titleStyle}>
				Часовой пояс: <span style={zoneInfoStyle}>{current ? posZoneLabel(current, apiInfo?.offset) : '—'}</span>
			</span>
			<div className='page-service-row'>
				<select
					className='page-service-select'
					value={zone}
					onChange={(e) => setZone(e.target.value)}
					disabled={zoneLoading || !zones.length}
				>
					<option value=''>— выберите часовой пояс —</option>
					{zoneGroups.map(([region, list]) => (
						<optgroup key={region} label={region}>
							{list.map((el) => (
								<option key={el} value={el}>
									{el}
								</option>
							))}
						</optgroup>
					))}
				</select>
			</div>
			<div className='page-service-row'>
				<Btn title='Установить часовой пояс' onClick={onSetZone} />
				<Btn
					title={zoneLoading ? 'Загрузка...' : 'Обновить список'}
					onClick={fetchZones}
				/>
			</div>
			<div className='page-service-row'>
				<Btn title='Перезагрузка Браузера ' onClick={() => closeChrome()} />
			</div>
		</>
	)
}

const titleStyle = { fontSize: '20px', fontWeight: 'bold' }
const zoneInfoStyle = { fontSize: '16px' }

// function onAL(enable, warn, clear) {
// 	const msg = enable ? 'включить' : 'выключить'
// 	const o = {
// 		type: 'attention',
// 		title: `Подтверждение действия`,
// 		text: `Вы уверены, что хотите ${msg} автоматический вход?`,
// 	}
// 	function fnYes() {
// 		const endpoint = enable ? 'auto_login/true' : 'auto_login/false'
// 		const errorMessage = enable
// 			? 'Ошибка включения автоматического входа'
// 			: 'Ошибка выключения автоматического входа'
// 		get(endpoint)
// 			.then((result) => {
// 				notification.success("AutoLogin действие выполнено")
// 			})
// 			.catch((e) => {
// 				notification.error(e.message || errorMessage, { errorId: e.id })
// 			})
// 			.finally(() => {
// 				clear()
// 			})
// 	}
// 	warn(o, 'warn', fnYes)
// }

function onReboot() {
	get('reboot')
		.then((result) => {
			notification.success('Перезагрузка устройства запущена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки устройств', {
				errorId: e.id,
			})
		})
}

function onShutdown() {
	get('shutdown')
		.then((result) => {
			notification.success('Выключение. устройства запущено')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка перезагрузки устройств', {
				errorId: e.id,
			})
		})
}
function closeChrome() {
	get('close_chrom')
		.then((result) => {
			notification.success('Закрытие браузера.')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка Закрытия браузера', {
				errorId: e.id,
			})
		})
}

function syncTime() {
	get('sync_time')
		.then((result) => {
			notification.success('Синхронизация времени завершена')
		})
		.catch((e) => {
			notification.error(e.message || 'Ошибка синхронизации времени', {
				errorId: e.id,
			})
		})
}

function onSetDateTime(warn, clear) {
	const o = {
		type: 'datetime',
		title: 'Установка даты и времени',
		onSave: (formattedDateTime) => {
			post('set_time', { dt: formattedDateTime })
				.then((result) => {
					notification.success('Время и дата успешно установлены')
				})
				.catch((e) => {
					notification.error(e.message || 'Ошибка установки времени и даты', {
						errorId: e.id,
					})
				})
				.finally(() => {
					clear()
				})
		},
	}
	warn(o, 'datetime')
}
