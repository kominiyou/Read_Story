export async function handleAntiWaMeLink(Wilykun, m, store) {
	if (m.key.remoteJid.endsWith('@g.us') && (m.message.conversation || m.message.extendedTextMessage?.text) && !m.key.fromMe) {
		const messageText = m.message.conversation || m.message.extendedTextMessage?.text;
		if (messageText.includes('wa.me')) {
			const participant = m.key.participant || m.key.remoteJid;
			const contact = store.contacts[participant] || {};
			const displayName = contact.notify || contact.vname || contact.name || participant.split('@')[0];
			const ppuser = await Wilykun.profilePictureUrl(participant, 'image').catch(() => 'https://via.placeholder.com/150');
			const ppgroup = await Wilykun.profilePictureUrl(m.key.remoteJid, 'image').catch(() => 'https://via.placeholder.com/150');

			await Wilykun.readMessages([m.key]); // Mark the message as read
			await Wilykun.sendMessage(m.key.remoteJid, { 
				image: { url: ppuser },
				caption: `Halo @${displayName}, link wa.me terdeteksi dan telah dihapus. Mohon untuk tidak membagikan link tersebut lagi 🚫`,
				mentions: [participant],
				contextInfo: {
					externalAdReply: {
						title: `Halo kak ${displayName} 👋`,
						body: 'Link wa.me terdeteksi dan dihapus 🚫',
						mediaType: 1,
						thumbnailUrl: ppgroup,
						mediaUrl: ppgroup,
						forwardingScore: 999,
						isForwarded: true,
						mentionedJid: [participant],
						businessMessageForwardInfo: {
							businessOwnerJid: Wilykun.user.id
						}
					}
				}
			}, { quoted: m });
			await Wilykun.sendMessage(m.key.remoteJid, { delete: m.key });
			console.log(`Deleted message with wa.me link from ${displayName} in group: ${m.key.remoteJid}`);
		}
	}
}
