import { useMemo, useState } from 'react'
import Btn from '@cmp/fields/btn'
import Input from '@cmp/fields/input'
import { post } from '@tool/api/service'
import { notification } from '@cmp/notification'
import useEquipStore from '@store/equipment'

// Проверка доступности устройств (модулей) по IP/домену
export default function Ping() {
	const list = useEquipStore((s) => s.list) ?? []
	const [status, setStatus] = useState({})
	const [custom, setCustom] = useState('')

	// Группировка по складам, дедупликация IP внутри группы
	const groups = useMemo(() => {
		return (list ?? [])
			.map((b) => {
				const seen = new Set()
				const rows = []
				;(b.mdl ?? []).forEach((m) => {
					const ip = m?.ip
					if (!ip || seen.has(ip)) return
					seen.add(ip)
					rows.push({ ip, port: m?.port })
				})
				rows.sort((a, b) => a.ip.localeCompare(b.ip, undefined, { numeric: true }))
				return { id: b._id, name: b.name || b.code, rows }
			})
			.filter((g) => g.rows.length)
	}, [list])

	const allIps = useMemo(() => {
		const set = new Set()
		groups.forEach((g) => g.rows.forEach((r) => set.add(r.ip)))
		return [...set]
	}, [groups])

	const runCheck = (hosts) => {
		const arr = (Array.isArray(hosts) ? hosts : [hosts]).filter(Boolean)
		if (!arr.length) return
		setStatus((s) => {
			const next = { ...s }
			arr.forEach((h) => (next[h] = { state: 'checking' }))
			return next
		})
		post('ping', { hosts: arr })
			.then((r) => {
				const results = Array.isArray(r) ? r : []
				setStatus((s) => {
					const next = { ...s }
					results.forEach((el) => {
						next[el.host] = {
							state: el.success ? 'online' : 'offline',
							time: el.time,
							message: el.message,
						}
					})
					return next
				})
			})
			.catch((e) => {
				setStatus((s) => {
					const next = { ...s }
					arr.forEach((h) => delete next[h])
					return next
				})
				notification.error(e.message || 'Ошибка проверки связи', {
					errorId: e.id,
				})
			})
	}

	const checkCustom = () => {
		const host = custom?.trim()
		if (!host) {
			notification.warning('Укажите IP адрес или домен')
			return
		}
		runCheck(host)
	}

	return (
		<>
			<span style={titleStyle}>Проверка связи:</span>

			<div className='page-service-row'>
				<Btn title='Проверить все' onClick={() => runCheck(allIps)} />
				<Input
					value={custom}
					setValue={setCustom}
					auth={false}
					placeholder='192.168.1.100 или example.com'
					keyboard='default'
				/>
				<Btn title='Проверить' onClick={checkCustom} />
			</div>

			{custom && status[custom?.trim()] && (
				<div className='page-service-row'>
					<span style={{ width: '240px' }}>{custom.trim()}</span>
					<Status st={status[custom.trim()]} />
				</div>
			)}

			{groups.length === 0 && (
				<div className='page-service-row'>
					<span>Нет устройств для проверки</span>
				</div>
			)}

			{groups.map((g) => (
				<div key={g.id} style={{ marginTop: '10px' }}>
					<span style={titleStyle}>{g.name}</span>
					<div style={tableWrapStyle}>
						<table style={tableStyle}>
							<thead>
								<tr>
									<th style={thStyle}>IP : порт</th>
									<th style={thStyle}>Статус</th>
									<th style={thStyle}>Проверить</th>
								</tr>
							</thead>
							<tbody>
								{g.rows.map((row) => (
									<tr key={row.ip}>
										<td style={tdStyle}>
											{row.ip}
											{row.port ? `:${row.port}` : ''}
										</td>
										<td style={tdStyle}>
											<Status st={status[row.ip]} />
										</td>
										<td style={tdStyle}>
											<Btn title='Проверить' onClick={() => runCheck(row.ip)} />
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			))}
		</>
	)
}

// Отображение статуса проверки
function Status({ st }) {
	if (!st) return <span style={{ color: '#888' }}>—</span>
	if (st.state === 'checking') return <span style={{ color: '#888' }}>проверка...</span>
	if (st.state === 'online')
		return (
			<span style={{ color: 'green' }}>
				доступен{st.time != null ? `, ${st.time} мс` : ''}
			</span>
		)
	return <span style={{ color: 'red' }}>{st.message || 'недоступен'}</span>
}

const titleStyle = { fontSize: '20px', fontWeight: 'bold' }

const tableWrapStyle = {
	overflowX: 'auto',
	maxHeight: 'calc(100vh - 420px)',
	overflowY: 'auto',
}

const tableStyle = {
	borderCollapse: 'collapse',
	width: '100%',
	fontSize: '14px',
}

const thStyle = {
	padding: '6px 10px',
	border: '1px solid #ccc',
	fontWeight: 'bold',
	backgroundColor: '#f5f5f5',
	textAlign: 'left',
	position: 'sticky',
	top: 0,
}

const tdStyle = {
	padding: '5px 10px',
	border: '1px solid #ddd',
}
