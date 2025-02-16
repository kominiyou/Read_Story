export async function handleAntiWhatsAppLink(Wilykun, m, store) {
	const messageContent = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
	const whatsappLinkPattern = /https:\/\/chat\.whatsapp\.com\/|chat\.whatsapp\.com\/|whatsapp\.com\//gi;

	if (whatsappLinkPattern.test(messageContent) && !m.key.fromMe && !messageContent.includes('wa.me')) {
		const participant = m.key.participant || m.key.remoteJid;
		const contact = store?.contacts?.[participant] || {};
		const displayName = contact.notify || contact.vname || contact.name || participant.split('@')[0];

		// Cek apakah pengirim adalah admin
		const groupMetadata = await Wilykun.groupMetadata(m.key.remoteJid);
		const groupOwner = groupMetadata.owner;
		const isAdmin = groupMetadata.participants.some(p => p.id === participant && p.admin);

		if (!isAdmin) {
			await Wilykun.readMessages([m.key]); // Mark the message as read
			await Wilykun.sendMessage(m.key.remoteJid, { 
				text: `Halo @${displayName}, link WhatsApp terdeteksi dan telah dihapus. Mohon untuk tidak membagikan link tersebut lagi 🚫`,
				mentions: [participant],
				contextInfo: {
					mentionedJid: [participant, groupOwner],
					forwardingScore: 100,
					isForwarded: true,
					forwardedNewsletterMessageInfo: {
						newsletterJid: '120363312297133690@newsletter',
						newsletterName: 'Info Anime Dll 🌟',
						serverMessageId: 143
					}
				}
			}, { quoted: m });
			await Wilykun.sendMessage(m.key.remoteJid, { delete: m.key });
			console.log(`Deleted message with WhatsApp link from ${displayName} in group: ${m.key.remoteJid}`);
		}
	}
}
