import { images } from '../../NOTIFIKASI/Url_Images_Anime.js'; // Impor URL gambar

export async function handleAntiWaMeLink(Wilykun, m, store) {
	if (m.key.remoteJid.endsWith('@g.us') && (m.message.conversation || m.message.extendedTextMessage?.text) && !m.key.fromMe) {
		const messageText = m.message.conversation || m.message.extendedTextMessage?.text;
		if (messageText.includes('wa.me')) {
			const participant = m.key.participant || m.key.remoteJid;
			const contact = store.contacts[participant] || {};
			const displayName = contact.notify || contact.vname || contact.name || participant.split('@')[0];
			const groupMetadata = await Wilykun.groupMetadata(m.key.remoteJid);
			const groupOwner = groupMetadata.owner;

			const randomImageUrl = images[Math.floor(Math.random() * images.length)]; // Pilih gambar random

			await Wilykun.readMessages([m.key]); // Mark the message as read
			await Wilykun.sendMessage(m.key.remoteJid, { 
				image: { url: randomImageUrl },
				caption: `Halo @${displayName}, link wa.me terdeteksi dan telah dihapus. Mohon untuk tidak membagikan link tersebut lagi 🚫`,
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
			console.log(`Deleted message with wa.me link from ${displayName} in group: ${m.key.remoteJid}`);
		}
	}
}
