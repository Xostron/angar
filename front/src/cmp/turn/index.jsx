import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import Btn from '@cmp/fields/btn'
import Entry from './entry'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/use_dialog'
import { useShallow } from 'zustand/react/shallow'
import useInputStore from '@store/input'
import { useParams } from 'react-router-dom'

//Включить/Выключить
export default function Turn({ style, cls }) {
	const { build } = useParams()
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const { refDialog, open, close } = useDialog()
	const [start] = useInputStore(useShallow(({ input }) => [input?.retain?.[build]?.start]))
	const img = isAuth ? '/img/turn.svg' : '/img/turn_b.svg'
	const st = isAuth ? style : { ...style, color: 'var(--primary)' }
	let cl = ['control', cls]
	cl = cl.join(' ')

	return (
		<>
			<Btn cls={cl} style={st} icon={img} title={start ? 'Вкл.' : 'Выкл.'} onClick={onClick} />
			<Dialog href={refDialog}>
				<Entry close={close} />
			</Dialog>
		</>
	)
	function onClick() {
		if (!isAuth) return
		open()
	}
}
