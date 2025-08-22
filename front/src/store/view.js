import { create } from 'zustand'

const EDGE = 1024

// Размер экрана
const useViewStore = create((set, get) => ({
	view: window.innerWidth < EDGE ? 'mobile' : 'pc',
	updateView: (_) => {
		let view = window.innerWidth < window.screen.width ? window.innerWidth : window.screen.width
		 view = view < EDGE ? 'mobile' : 'pc'
		if (get().view === view) return
		set({ view })
	},
	mb: (_) => (get().view === 'mobile' ? 'mb' : ''),
	bmb: (_) => get().view === 'mobile',
}))

export default useViewStore
