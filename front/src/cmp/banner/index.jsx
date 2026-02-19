import Dialog from '@cmp/dialog'
import useBanner from '@cmp/banner/use_banner'
import useInputStore from '@store/input'
import { useParams } from 'react-router-dom'
import { useEffect } from 'react'
import Item from './item'

export default function Banner({ type = 'building' }) {
	let { build, sect } = useParams()
	const { refBanner, open } = useBanner()
	const b = useInputStore((s) => s.bannerB(build))
	const s = useInputStore((s) => s.bannerS(build, sect))
	useEffect(() => {
		open()
	}, [])
	const ws = `banner-${s?.length}`
	const wb = `banner-${b?.length}`

	// для секции
	return type === 'section' ? (
		<Dialog cls={`banner ${ws}`} href={refBanner}>
			{!!s.length && s.map((el, idx) => <Item key={idx} data={el} />)}
		</Dialog>
	) : (
		// для склада
		<Dialog cls={`banner ${wb}`} href={refBanner}>
			{!!b.length && b.map((el, idx) => <Item key={idx} data={el} />)}
		</Dialog>
	)
}
