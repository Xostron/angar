module.exports = function disconnect(io, socket) {
	// disconnecting - происходит перед disconnect, может использоваться для регистрации выхода пользователя из непустой комнаты:
	socket.on('disconnecting', (reason) =>
		console.log('disconnecting', socket.id, reason)
	);

	// disconnect - происходит при отключении сокета
	socket.on('disconnect', (reason) =>
		console.log('disconnect', socket.id, reason)
	);
};
