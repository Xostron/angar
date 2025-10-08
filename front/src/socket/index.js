import { io } from 'socket.io-client';
import uri from '@store/uri';

// "undefined" means the URL will be computed from the `window.location` object
const config = {
	// extraHeaders - дополнительные заголовки, сохраняются на протяжении сессии (не могут быть изменены):
	// extraHeaders: {
	// "custom-header": "chat-app"
	//   }
	// })
	// extraHeaders: {
	// 	authorization: `bearer `,
	// 	// authorization: `bearer ${access}`,
	// },
	reconnectionDelay: 5000,
	reconnectionDelayMax: 5000,
	// auth: {
	// 	token: '123',
	// },
	autoConnect: true,
	// дополнительные параметры строки запроса, сохраняются на протяжении сессии (не могут быть изменены):
	// query: {
	// 	'my-key': 'my-value',
	// },
};

export const socket = io(uri.socket, config);
