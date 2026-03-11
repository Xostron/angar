import { useState, useEffect, useCallback, useRef } from 'react'
import useHistoryStore from '@store/history'
import useDialog from '@cmp/dialog/hook'
import Btn from '@cmp/fields/btn'
import { notification } from '@cmp/notification'
import { clearHistory } from '@tool/api/history'
import { getActivity } from '@tool/api/activity'
import useEquipStore from '@store/equipment'
import '@cmp/fields/style.css'





const LIMIT = 15

function todayStr() {
	return new Date().toISOString().slice(0, 10)
}

function getInfo(equip, secList) {
	return equip.map(e=>{
		secList.push(...e.section?.map(s=>{
			return {
				_id: s._id,
				name: s.name,
				order: s.order,
				buildingId: s.buildingId,
				bld: {
					code: e.code,
					name: e.name,
					order: e.order,
				}
			}
		}))
		return {
			_id: e._id,
			code: e.code,
			name: e.name,
			order: e.order,
		}
	})
}


export default function Journal() {
	const equip = useEquipStore(s=>s.list)
	// console.log(JSON.stringify(equip))
	// Список всех секций
	const secList = []
	// Список складов
	const bldList = getInfo(equip, secList)

	const bldMap = Object.fromEntries(bldList.map(b => [b._id, b.name || b.code]))
	const secMap = Object.fromEntries(secList.map(s => [s._id, s.name || s._id]))

	const historyActive = useHistoryStore((s) => s.active)
	const toggleHistory = useHistoryStore((s) => s.toggle)
	const { refDialog, open: openConfirm, close: closeConfirm } = useDialog()

	const [items, setItems] = useState([])
	const [total, setTotal] = useState(0)
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)

	const [dateFrom, setDateFrom] = useState(todayStr())
	const [dateTo, setDateTo] = useState(todayStr())
	const [filterBld, setFilterBld] = useState('')
	const [filterSec, setFilterSec] = useState('')

	const dateFromRef = useRef(dateFrom)
	const dateToRef = useRef(dateTo)
	const filterBldRef = useRef(filterBld)
	const filterSecRef = useRef(filterSec)
	dateFromRef.current = dateFrom
	dateToRef.current = dateTo
	filterBldRef.current = filterBld
	filterSecRef.current = filterSec

	const filteredSecList = filterBld
		? secList.filter(s => s.buildingId === filterBld)
		: secList

	const totalPages = Math.max(1, Math.ceil(total / LIMIT))

	const fetchData = useCallback((p, from, to, bld, sec) => {
		const f = from ?? dateFromRef.current
		const t = to ?? dateToRef.current
		const b = bld ?? filterBldRef.current
		const s = sec ?? filterSecRef.current
		const isoFrom = f ? new Date(f + 'T00:00:00').toISOString() : undefined
		const isoTo = t ? new Date(t + 'T23:59:59.999').toISOString() : undefined

		setLoading(true)
		getActivity(p, LIMIT, isoFrom, isoTo, b || undefined, s || undefined)
			.then((r) => {
				setItems(r.items || [])
				setTotal(r.total || 0)
				setPage(r.page || p)
			})
			.catch((e) => notification.error(e?.message || 'Ошибка загрузки'))
			.finally(() => setLoading(false))
	}, [])

	useEffect(() => { fetchData(1) }, [fetchData])

	const goPage = (p) => {
		const next = Math.max(1, Math.min(totalPages, p))
		fetchData(next)
	}

	const applyFilter = () => fetchData(1)

	const resetFilter = () => {
		const today = todayStr()
		setDateFrom(today)
		setDateTo(today)
		setFilterBld('')
		setFilterSec('')
		fetchData(1, today, today, '', '')
	}

	return (
		<>
			<span style={titleStyle}>Режим истории за 7 дней:</span>
			<div className='page-service-row'>
				<label className='switch'>
					<input
						type='checkbox'
						checked={historyActive}
						onChange={() => toggleHistory(!historyActive)}
					/>
					<span className='slider'>
						<p>{historyActive ? 'Вкл' : 'Выкл'}</p>
					</span>
				</label>
				<Btn
					title='Очистить записи истории'
					style={{width: '400px'}}
					onClick={openConfirm}
				/>
			</div>

			<dialog ref={refDialog} style={dialogStyle} onClick={(e) => { if (e.target === e.currentTarget) closeConfirm() }}>
				<div style={dialogContentStyle}>
					<p style={{ margin: '0 0 16px', fontSize: '16px' }}>Вы уверены, что хотите очистить все записи истории?</p>
					<div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
						<Btn title='Отмена' onClick={closeConfirm} />
						<Btn
							title='Очистить'
							onClick={() => {
								closeConfirm()
								clearHistory()
									.then((r) => {
										const { removed } = r
										notification.success(
											`Записи удалены: alarm: ${removed?.alarm ?? 0}, input: ${removed?.input ?? 0}, equip: ${removed?.equip ?? 0}`
										)
									})
									.catch((e) => notification.error(e?.message || 'Ошибка очистки истории'))
							}}
						/>
					</div>
				</div>
			</dialog>

			{/* <br /> */}
			<hr />
			{/* <br /> */}

			<span style={titleStyle}>Архив действий:</span>

			<div style={filterRowStyle}>
				<label style={filterLabel}>
					С:
					<input
						type='date'
						value={dateFrom}
						onChange={(e) => setDateFrom(e.target.value)}
						style={dateInputStyle}
					/>
				</label>
				<label style={filterLabel}>
					По:
					<input
						type='date'
						value={dateTo}
						onChange={(e) => setDateTo(e.target.value)}
						style={dateInputStyle}
					/>
				</label>
				<label style={filterLabel}>
					Склад:
					<select
						value={filterBld}
						onChange={(e) => {
							setFilterBld(e.target.value)
							setFilterSec('')
						}}
						style={selectStyle}
					>
						<option value=''>Все</option>
						{bldList.map(b => (
							<option key={b._id} value={b._id}>{b.name || b.code}</option>
						))}
					</select>
				</label>
				<label style={filterLabel}>
					Секция:
					<select
						value={filterSec}
						onChange={(e) => setFilterSec(e.target.value)}
						style={selectStyle}
					>
						<option value=''>Все</option>
						{filteredSecList.map(s => (
							<option key={s._id} value={s._id}>{s.name || s._id}</option>
						))}
					</select>
				</label>
				<Btn title='Показать' onClick={applyFilter} />
				<Btn title='Сегодня' onClick={resetFilter} />
			</div>

			{loading && <span style={{ color: '#888' }}>Загрузка...</span>}

			<div style={tableWrapStyle}>
				<table style={tableStyle}>
					<thead>
						<tr>
							<th style={thStyle}>Дата / Время</th>
							<th style={thStyle}>Склад</th>
							<th style={thStyle}>Секция</th>
							<th style={thStyle}>Пользователь</th>
							<th style={thStyle}>Действие</th>
							<th style={thStyle}>Тип</th>
							<th style={thStyle}>Значение</th>
						</tr>
					</thead>
					<tbody>
						{items.length === 0 && !loading && (
							<tr>
								<td style={tdStyle} colSpan={7}>Нет данных</td>
							</tr>
						)}
						{items.map((row) => (
							<tr key={row._id}>
								<td style={tdNoWrap}>{formatDate(row.ts)}</td>
								<td style={tdStyle}>{bldMap[row.bldId] || row.bldId || '—'}</td>
								<td style={tdStyle}>{secMap[row.secId] || row.secId || '—'}</td>
								<td style={tdStyle}>{row.clientId || row.name || '—'}</td>
								<td style={tdStyle}>{row.title || '—'}</td>
								<td style={tdNoWrap}>{row.type || '—'}</td>
								<td style={tdStyle}>{row.value}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div style={paginationStyle}>
				<button style={pageBtnStyle} disabled={page <= 1} onClick={() => goPage(page - 1)}>
					&#9664; Назад
				</button>
				<span>
					Стр. {page} / {totalPages}
					{total > 0 && <> &nbsp;(записей: {total})</>}
				</span>
				<button style={pageBtnStyle} disabled={page >= totalPages} onClick={() => goPage(page + 1)}>
					Вперёд &#9654;
				</button>
			</div>
		</>
	)
}

function formatDate(ts) {
	if (!ts) return '—'
	return new Date(ts).toLocaleString('ru-RU', {
		day: '2-digit', month: '2-digit', year: 'numeric',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
	})
}

function formatValue(val) {
	if (val == null) return '—'
	if (typeof val === 'boolean') return val ? 'Вкл' : 'Выкл'
	return String(val)
}

const titleStyle = { fontSize: '20px', fontWeight: 'bold' }

const filterRowStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '10px',
	flexWrap: 'wrap',
}

const filterLabel = {
	display: 'flex',
	alignItems: 'center',
	gap: '4px',
	fontSize: '14px',
}

const dateInputStyle = {
	padding: '4px 6px',
	border: '1px solid #ccc',
	borderRadius: '4px',
	fontSize: '14px',
}

const selectStyle = {
	padding: '4px 6px',
	border: '1px solid #ccc',
	borderRadius: '4px',
	fontSize: '14px',
	minWidth: '120px',
}

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

const tdNoWrap = {
	...tdStyle,
	whiteSpace: 'nowrap',
}

const paginationStyle = {
	display: 'flex',
	alignItems: 'center',
	gap: '12px',
	marginTop: '8px',
}

const pageBtnStyle = {
	padding: '4px 12px',
	cursor: 'pointer',
}

const dialogStyle = {
	border: 'none',
	borderRadius: '8px',
	padding: 0,
	boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
	position: 'fixed',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
}

const dialogContentStyle = {
	padding: '24px',
	minWidth: '320px',
}
