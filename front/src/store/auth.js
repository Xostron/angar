import { create } from 'zustand';

/**
 * Пример Zustand
 * https://docs.pmnd.rs/zustand/getting-started/introduction
 * @param {*} set
 * @returns
 */
const useAuthStore = create((set, get) => ({
	isAuth: false,
	access: '',
	refresh: '',
	name: '',
	updateAccess: (access) => set({ access }),
	updateRefresh: (refresh) => set({ refresh }),
	updateTokens: (access, refresh) => set({ access, refresh }),
	delTokens: () => set({ access: '', refresh: '' }),
	logout: _ => set({isAuth: false})
}));

export default useAuthStore;
