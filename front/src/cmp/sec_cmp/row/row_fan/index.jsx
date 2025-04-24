import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import ItemFan from './item'
import Entry from '@cmp/modal/fan'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/use_dialog'
// import running from '@tool/status/build_section'
import '../style.css'

export default function Row({ active, data = [], cls }) {
	const { refDialog, open, close } = useDialog()
	const { build, sect } = useParams()
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [getFan] = useInputStore(({ getFan }) => [ getFan])
	const [fdata, setFdata] = useState(null)
	// Данные для children модального окна
	useEffect((_) => setFdata(fdata), [fdata])

	// Режим работы секции
	// const { isOff } = running(build, sect)
	// Заблокированна кнопка (Не авторизован, секция выключена)
	const locked = !isAuth

	let cl = ['section-info-row', cls]
	cl = cl.join(' ')
	return (
		<>
			<div className={cl}>
				{data?.length &&
					data.map((el, idx) => {
						// Состояние вентилятора
						const state = getFan(el)?.state
						// Данные для children модального окна
						const action = () => {
							if (locked) return
							setFdata({ ...el, buildingId: build, sectionId: sect, active })
							open()
						}
						return <ItemFan key={idx} state={state}  action={action} locked={locked} />
					})}
			</div>
			<Dialog href={refDialog}>{fdata && <Entry data={fdata} setData={setFdata} close={close} />}</Dialog>
		</>
	)
}
