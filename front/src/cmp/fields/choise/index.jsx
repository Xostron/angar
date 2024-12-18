import { useState } from 'react'
import Modal from './modal'

export default function Choise({ data, setData, list, style }) {
	const [show, setShow] = useState(false)
	return (
		<span style={style} className='cell popup' onClick={(_) => setShow(!show)}>
			<button>
				<img src={'/img/popup.svg'} id={'popup'} />
			</button>
			<Modal data={data} setData={setData} list={list} show={show} setShow={setShow} t={2} />
		</span>
	)
}
