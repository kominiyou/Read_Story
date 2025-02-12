/**
 * Menangani fitur auto typing.
 * @param {import('baileys').WASocket} Wilykun - Instance WASocket.
 * @param {object} m - Pesan yang diterima.
 */
export async function handleAutoTyping(Wilykun, m) {
	const enableTyping = process.env.ENABLE_TYPING === 'true';
	const enableRecording = process.env.ENABLE_RECORDING === 'true';
	const markAsReceived = process.env.MARK_AS_RECEIVED === 'true';

	// Show typing or recording status if enabled
	if (enableTyping) {
		await Wilykun.sendPresenceUpdate('composing', m.key.remoteJid);
	} else if (enableRecording) {
		await Wilykun.sendPresenceUpdate('recording', m.key.remoteJid);
	}

	// Tandai pesan sebagai telah diterima (ceklis dua abu-abu) jika diaktifkan
	if (markAsReceived) {
		await Wilykun.sendPresenceUpdate('available', m.key.remoteJid);
	}
}
