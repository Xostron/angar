import { useShallow } from 'zustand/react/shallow'
import useRemoteStore from '@store/remote'
import useDialog from '@cmp/dialog/hook'
import Mode from '../mode'
import Tout from '../tout'

export default function Remote({cl, doc, item}){
	const device = useRemoteStore(useShallow((s) => {
		const deviceId = doc?.deviceId ?? item?.deviceId
		return deviceId ? (s.devices?.[deviceId] ?? null) : null
	}))
	const off = device?.status !== true
	const noData = !off && !doc
	const access = localStorage.getItem('access')
	const name = localStorage.getItem('name')
	let cls = cl
	if (off) cls += ' out'
	if (noData) cls += ' nodata'
	const { refDialog, open, close, isOpen } = useDialog()

	return (
			<>
				<div className={cls} onClick={!off ? open: ()=>{}}>
					<div>
						<div className='top'>
							<p>{doc?.code} {doc?.name ?? item?.name}</p>
							{noData ? (
								<span className='off'>Нет данных</span>
							) : off ? (
								<span className='off'>{device?.description ?? 'Подключение...'}</span>
							) : (
								<span className={doc?.sidesect?.start ? 'on' : 'off'}>
									{doc?.sidesect?.start ? 'Вкл.' : 'Выкл.'}
								</span>
							)}
						</div>
						{!noData && !off && doc && <Mode doc={doc} />}
						{!noData && !off && doc && (
							<div className='bottom'>
								<Tout doc={doc} />
							</div>
						)}
					</div>
				</div>
				<dialog ref={refDialog} className='dia remote-dia' onClick={(e) => { if (e.target === e.currentTarget) close() }}>
					<button className='remote-dia-close' onClick={close}></button>
					{/* TODO: Убрать порт для нормальной работы */}
					{/* <iframe src={`http://${doc?.ip}:4010/building/${item._id}`} title={item.name} /> */}
					{isOpen && (
						<iframe
							src={`http://${item.ip}/building/${item.bldId}${
								access ? `?access=${encodeURIComponent(access)}&name=${encodeURIComponent(name ?? '')}` : ''
							}`}
							title={item.name}
						/>
					)}
				</dialog>
			</>
		)
}
