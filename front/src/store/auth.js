import { create } from 'zustand'

/**
 * Пример Zustand
 * https://docs.pmnd.rs/zustand/getting-started/introduction
 * @param {*} set
 * @returns
 */
const useAuthStore = create((set, get) => ({
	isAuth: false,
	get checkAuth() {
		return !!localStorage.getItem('access')
	},
	access: '',
	refresh: '',
	name: 'Панель',
	last:null,
	updateAccess: (access) => set({ access }),
	updateRefresh: (refresh) => set({ refresh }),
	updateTokens: (access, refresh) => set({ access, refresh }),
	delTokens: () => set({ access: '', refresh: '' }),
	logout: (_) => {
		localStorage.removeItem('access')
		localStorage.removeItem('name')
		set({ isAuth: false, name: 'Панель' })
	},
}))

export default useAuthStore
