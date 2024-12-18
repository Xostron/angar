import Helmet from 'react-helmet'
import useEquipStore from '@store/equipment'
import { useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
function Version() {
	const [title, setTitle] = useState('')
	const list = useEquipStore(useShallow(({ list }) => list))

	const {name, code} = list?.[0]?.company ?? {}

	useEffect(() => {
		if(name && code) setTitle(`${code} ${name} `)
	}, [name, code])

	return (
		<div style={{ position: 'absolute', bottom: '15px', right: '15px', color: 'darkgray' }}>
			<Helmet  title={title}/>
			<p>server v2.0.4: {process.env.PUBLIC_SOCKET_URI}</p>
		</div>
	)
}
export default Version
