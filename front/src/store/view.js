import { create } from 'zustand'

const TABLET = 1024
const MOBILE = 768

// Store: Размер экрана
const useViewStore = create((set, get) => ({
	view: window.innerWidth < MOBILE ? 'mobile' : 'pc',
	updateView: (_) => {
		// Текущий размер экрана
		let view = window.innerWidth < window.screen.width ? window.innerWidth : window.screen.width
		// Тип экрана: mobile||pc
		view = view < MOBILE ? 'mobile' : 'pc'
		if (get().view === view) return
		set({ view })
	},
	mb: (_) => (get().view === 'mobile' ? 'mb' : ''),
	bmb: (_) => get().view === 'mobile',
}))

export default useViewStore
