import { create } from 'zustand'
import { get as getApi } from '@tool/api/service'
import { notification } from '@cmp/notification'
import { uri } from '@store/uri'

const useServiceStore = create((set, get) => ({
	req_ip: '127.0.0.1',
	info: null,
	ttyS: null,

	setReqIp: (ip) => set({ req_ip: ip }),
	setInfo: (info) => set({ info }),
	setTtyS: (ttyS) => set({ ttyS }),

	/**
	 * Загрузка информации о сети и COM-портах.
	 * При успехе обновляет req_ip на targetIp.
	 * @param {string} [ip] — IP для запроса (по умолчанию uri сервера)
	 * @returns {Promise}
	 */
	fetchNetInfo: (ip) => {
		const targetIp = ip || get().req_ip
		return getApi('net_info', targetIp)
			.then((o) => {
				set({ info: o.net, ttyS: o.ttyS, req_ip: targetIp })
				notification.success('Информация о сети обновлена')
			})
			.catch((e) => {
				notification.error(
					e.message || e.error || 'Ошибка получения информации о сети от: ' + targetIp,
					{ errorId: e.id }
				)
				set({ info: null })
				throw e
			})
	},
}))

export default useServiceStore
