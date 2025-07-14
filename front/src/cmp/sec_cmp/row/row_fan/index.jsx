import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useInputStore from '@store/input'
import useAuthStore from '@store/auth'
import useDialog from '@cmp/dialog/hook'
import EntryFan from '@cmp/modal/fan'
import EntryFao from '@cmp/modal/fan_ao'
import Dialog from '@cmp/dialog'
import ItemFan from './item/fan'
import ItemCooler from './item/cooler'
// import running from '@tool/status/build_section'
import '../style.css'

export default function Row({ active, fan = [], cooler = [], cls = '' }) {
	const { build, sect } = useParams()
	const { refDialog, open, close } = useDialog()
	const { isAuth } = useAuthStore(({ isAuth, name }) => ({ isAuth, name }))
	const [getFan] = useInputStore(({ getFan }) => [getFan])

	// Данные для модального окна
	const [fdata, setFdata] = useState(null)
	useEffect((_) => setFdata(fdata), [fdata])

	// Модальное окно ВНО
	const entry = fdata?.ao ? <EntryFao data={fdata} setData={setFdata} close={close} /> : <EntryFan data={fdata} setData={setFdata} close={close} />

	let cl = ['cmp-sec-row', cls]
	cl = cl.join(' ')
	return (
		<>
			<div className={cl}>
				{!!fan?.length &&
					fan.map((el) => {
						// данные о ВНО
						const d = getFan(el)
						// Данные для модального окна
						const action = () => {
							if (!isAuth) return
							setFdata({ ...d, buildingId: build, sectionId: sect, active })
							open()
						}
						return <ItemFan key={el._id} data={d} action={action} isAuth={isAuth} />
					})}
				{/* Испарители + датчик температуры всасывания */}
				{!!cooler?.length &&
					cooler.map((el) => {
						// Данные для модального окна
						const action = () => {
							if (!isAuth) return
							setFdata({ ...el, buildingId: build, sectionId: sect, active })
							open()
						}
						return <ItemCooler key={el._id} data={el} action={action} isAuth={isAuth} />
					})}
			</div>
			<Dialog href={refDialog}>{fdata && entry}</Dialog>
		</>
	)
}
