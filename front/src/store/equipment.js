import fnSkip from '@src/page/settings/skip'
import { create } from 'zustand'

const useEquipStore = create((set, get) => ({
	list: [],
	factory: {},
	weather: {},
	curB: null,
	curS: null,
	apiInfo: {},
	// сохранить в стейт list[]
	initE: (r) => {
		if (!r) return
		set({ factory: r?.factory })
		set({ list: r?.building })
		set({ weather: r?.weather ?? {} })
		set({ apiInfo: r?.apiInfo })
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

	getFactory(type, skip, prd, curPrd) {
		// Список заводских настроек
		let list = get()?.factory?.[type]?._prd
			? (get()?.factory?.[type]?.[prd] ?? null)
			: (get()?.factory?.[type]?.list ?? null)
		// Имя настройки
		const name = get()?.factory?.[type]?._name

		if (!list) return null

		// Настройки для неосновного продукта, показываем полные настройки
		if (curPrd !== prd) return { name, list }
		// return { name, list }
		// Настройки текущего продукта (здесь можно скрывать/показывать группы настроек)

		return {
			name,
			list: list.filter((el) => !skip.includes(el._code)),
		}
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
	/**
	 * Тип склада: обычный, холодильник, комбинированный
	 * @param {string} id Id склада
	 * @returns {string} normal/cold/combi
	 */
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
