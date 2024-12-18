import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'

import '../style.css'
import Modal from './modal'
import Text from '@cmp/fields/text'

//Выпадающий список
export default function Popup({ data, style }) {
	const { isAuth } = useAuthStore(({ isAuth }) => ({ isAuth }))
	if (!data || !data.list?.length) return null
	// data.value = 'Режим управления'
	const [show, setShow] = useState(false)
	const [val, setVal] = useState(data.value)
	useEffect(() => {
		setVal(data.value)
	}, [data.value])

	if (!isAuth) return <Text data={{ value: val }} />
	return (
		<span style={style} className='cell popup' onClick={(_) => setShow(!show)}>
			<button>
				<img src={'/img/popup.svg'} id={'popup'} />
			</button>
			<p className='val' title={val}>
				{val}
			</p>
			<Modal
				show={show}
				setShow={setShow}
				list={data.list}
				setVal={(val) => {
					setVal(val)
					data.setValue(val)
				}}
				val={val}
			/>
		</span>
	)
}
