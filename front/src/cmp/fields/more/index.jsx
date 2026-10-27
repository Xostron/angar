import { useEffect, useState } from 'react'
import useAuthStore from '@store/auth'

import '../style.css'
import Text from '@cmp/fields/text'

//Выпадающий список
export default function More({ data, style, title }) {
	// const isAuth = useAuthStore((s) => s.isAuth)
	// console.log(33, data)
	// if (!data || !data.list?.length) return null
	// data.value = 'Режим управления'
	// const [show, setShow] = useState(false)

	// if (!isAuth) return <Text data={{ value: data.value }} title={title} />
	// console.log(11,data)
	return (
		<button style={style} className='cell more' onClick={(_) => {}} title={title}>
			<p className='val'>{data.value} </p>
			<img width='18px' src='/img/arrow-right.svg' />
		</button>
	)
}
