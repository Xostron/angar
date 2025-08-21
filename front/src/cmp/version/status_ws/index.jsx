import useSocketStore from '@store/socket'

export default function StatusWS() {
	const on = useSocketStore((s) => s.on)
	return (
		<div
			style={{
				width: '.5em',
				height: '.5em',
				borderRadius: '50%',
				backgroundColor: !on ? 'darkgray' : 'lightgreen',
			}}
		></div>
	)
}
