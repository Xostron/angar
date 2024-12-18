import { create } from 'zustand'

//Хранилище состояния предупреждений
const useWarn = create((set, get) => ({
	show: false,
	data: {},
	link: {},
	warn: (data) => {
		set({ show: true, data })
	},
	cancel: () => set({ show: false, data: {} }),
	setLink(data) {
		if (!data) set({ link: {} })
		set({ link: { ...data } })
	},
}))

export default useWarn
