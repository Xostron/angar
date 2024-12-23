import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './style.css'
import useInputStore from '@store/input'

//Отображение сообщений: Продукт достиг температрцы задания, и т.д.
export default function Message() {
	const { build } = useParams()
	const [hid, setHid] = useState(true)
	const [achieve] = useInputStore(({ alarm }) => [alarm.achieve])
	
	// Подсветка "синим" - продукт достиг задания
	let cl = ['mes']
	useEffect(
		(_) => {
			const onClick = (e) => {
				if (e.target.closest('.act')) return
				setHid(true)
			}
			document.addEventListener('click', onClick)
			return (_) => document.removeEventListener('click', onClick)
		},
		[hid]
	)
	let arr = achieve?.[build]
	if (!arr?.length) return null

	const act = arr.find((el) => el?.order === 1)
	if (act) cl.push('act')
	cl = cl.join(' ')

	// если нет сообщений - для каждого режима своя инфа
	
	if (arr.length == 1)
		return (
			<div className={cl}>
				<p className='text'>{arr[0]?.msg}</p>
			</div>
		)
	return (
		<div className='mes-container'>
			<div className='all' hidden={hid}>
				{arr.map((el, i) => (
					<p key={i}>{el.msg}</p>
				))}
			</div>
			<div className={cl} onClick={(_) => setHid(false)}>
				<p className='text'>{arr[0]?.msg}</p>
			</div>
		</div>
	)
}
