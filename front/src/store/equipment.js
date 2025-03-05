import { create } from 'zustand'

const useEquipStore = create((set, get) => ({
	list: [],
	factory: {},
	weather: {},
	curB: null,
	curS: null,
	// сохранить в стейт list[]
	initE: (r) => {
        console.log('initE', r)
		if (!r) return
        console.log('initE, r = ', r)
		set({ factory: r?.factory })
		set({ list: r?.building })
		set({ weather: r?.weather ?? {} })
	},
	// установить индекс массива (для навигации по стейту list[])
	setCurB: (i) => set({ curB: i }),
	setCurS: (i) => set({ curS: i }),
	// Получение индекса массива (при обновлении страницы)
	getCurB: (idB) => get()?.list?.findIndex((el) => el._id === idB),
	getCurS: (idS) => get()?.list?.[get()?.curB]?.section?.findIndex((el) => el._id === idS),
	build: () => get()?.list?.[get()?.curB],
	prdList: (idB) => {
		const idx = get().getCurB(idB)
		return get()?.list?.[idx]?.product ?? []
	},
	sections: () => get()?.build()?.section,
	section: () => get().sections()?.[get()?.curS],
	getSigByType(idB, idS, type) {
		if (!idB || !idS || !type) return null
		const signal = get()
			?.list?.find((o) => o?._id == idB)
			?.section?.find((s) => s?._id == idS)
			?.signal?.find((sig) => sig?.type == type)
		return signal?._id
	},
	getFactory(type, prd) {
		if (!prd) return get()?.factory?.[type] ?? null
		return get()?.factory?.[type]?.[prd] ?? null
	},
	getKindList(idB) {
		const idx = get().getCurB(idB)
		return get()?.list?.[idx]?.kindList ?? []
	},

	// Список настроек для типизированного склада
	getMenuFactory(idB, ext = []) {
		const idx = get().getCurB(idB)
		// Список настроек для данного склада
		const kind = get()?.list?.[idx]?.kindList ?? []
		// Рама настроек
		const list = Object.entries(get()?.factory)
			.filter(([key, data]) => kind.includes(key))
			.map(([key, data], id) => ({
				id,
				code: key,
				name: data._name,
				order: data._order,
				icon: `/img/settings/${key}.svg`,
				path: `../settings/${key}`,
			}))
			.sort((a, b) => a.order - b.order)

		// Доп. функционал (калибровка датчиков)
		get()?.list?.[idx]?.type !== 'cold' ? list.push(...ext) : null
		return list
	},
	getType: (id) => {
		if (!id) return null
		return get()?.list?.find((el) => el?._id === id)?.type
	},
	curType: () => {
		const build = get()?.build()
		if (!build) return null
		return get().getType(build._id)
	},
	getDevice: (key) => {},
}))

export default useEquipStore
