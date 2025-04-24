import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'
import useInputStore from '@store/input'
import EntryV from '@cmp/modal/valve'
import EntryH from '@cmp/modal/heating'
import Btn from '@cmp/fields/btn'
import defImg from '@src/tool/icon'
import Dialog from '@cmp/dialog'
import useDialog from '@cmp/dialog/use_dialog'
import Valve from './valve'
import './style.css'

export default function Other({ active, data }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	const { refDialog, open, close } = useDialog()
	const { heating = [], valve = [] } = data
	const [input] = useInputStore(({ input }) => [input])
	const [fdata, setFdata] = useState(null)

	// данные для popup
	useEffect((_) => setFdata(fdata), [fdata])

	if (!valve && !heating) return null

	const vin = valve?.filter((v) => v.type === 'in')
	const vout = valve?.filter((v) => v.type === 'out')
	if (!vin) return null
	// Состояние обогревателя
	const stateH = input?.outputEq?.[heating?.[0]?._id] == 1 ? 'on' : 'off'
	const imgH = defImg.heating?.[stateH]

	let cls = ['section-info-other']
	cls = cls.join(' ')
	return (
		<>
			<div className={cls}>
				<div className='sio-valve-map' style={{ alignItems: 'start' }}>
					{vin.map((el, i) => (
						<Valve key={i} valve={el} onClick={onClick} active={active} />
					))}
				</div>

				<span style={{ textAlign: 'start' }}>
					Приточный <br /> клапан
				</span>

				<div className={cls}>{stateH === 'on' && <img src={imgH} />}</div>
				
				<span style={{ textAlign: 'end' }}>
					Выпускной <br /> клапан
				</span>

				<div className='sio-valve-map' style={{ alignItems: 'end' }}>
					{vout.map((el, i) => (
						<Valve key={i} valve={el} onClick={onClick} active={active} />
					))}
				</div>

				<Dialog href={refDialog}>
					{fdata?.type === 'valve' && <EntryV data={fdata} setData={setFdata} close={close} />}
				</Dialog>
			</div>
		</>
	)

	function onClick(obj) {
		if (!isAuth || !active) return
		setFdata(obj)
		open()
	}
}
