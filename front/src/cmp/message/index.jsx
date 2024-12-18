import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import './style.css'
import useInputStore from '@store/input'

//Отображение сообщений: Продукт достиг температрцы задания, и т.д.
export default function Message() {
	const { build } = useParams()
	const [hid, setHid] = useState(true)
	const [achieve, automode] = useInputStore(({ alarm, automode }) => [alarm.achieve, automode])
	// const mode = automode(build)
	let arr = achieve?.[build]
	// if (achieve?.[build]) arr = Object.values(achieve?.[build]?.[mode]).reverse()


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

	// если нет сообщений - для каждого режима своя инфа
	if (!arr?.length) return <></>
	if (arr.length == 1)
		return (
			<div className='mes'>
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
			<div className='mes act' onClick={(_) => setHid(false)}>
				<p className='text'>{arr[0]?.msg}</p>
			</div>
		</div>
	)
}
