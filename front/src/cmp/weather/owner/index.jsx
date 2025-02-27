import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'
import { elapsedTime } from '@tool/datetime'
import { useParams } from 'react-router-dom'
import './style.css'

export default function Owner({ data = {}, cls }) {
	const { company, code } = data
	const { build } = useParams()
	const [datestop] = useInputStore(useShallow(({ input }) => [input?.retain?.[build]?.datestop]))
	let cl = ['w-owner', cls]
	cl = cl.join(' ')
	const elapsed = elapsedTime(datestop)
	return (
		<div className={cl}>
			<div className='w-owner-head'>
				<span> {code} </span>
			</div>
			<span>{company.name}</span>
			{elapsed && <span id='w-owner-status'>Выключен {elapsed} назад</span>}
		</div>
	)
}
