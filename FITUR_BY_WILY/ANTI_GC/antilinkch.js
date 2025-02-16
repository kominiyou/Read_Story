import dotenv from 'dotenv';
import { images } from '../../NOTIFIKASI/Url_Images_Anime.js'; // Impor URL gambar

dotenv.config(); // Load .env file

export async function handleAntiChannelLink(Wilykun, m, store) {
	const channelLinkRegex = /https:\/\/whatsapp\.com\/channel\//;
	const forwardedChannelRegex = /Lihat saluran/;

	if (process.env.ENABLE_ANTI_CHANNEL_LINK === 'true' && !m.key.fromMe && (channelLinkRegex.test(m.text) || forwardedChannelRegex.test(m.text))) {
		const groupMetadata = await Wilykun.groupMetadata(m.key.remoteJid);
		const groupOwner = groupMetadata.owner;
		const participant = m.key.participant || m.key.remoteJid;
		const contact = store?.contacts?.[participant] || {};
		const displayName = contact.notify || contact.vname || contact.name || participant.split('@')[0];

		const randomImageUrl = images[Math.floor(Math.random() * images.length)]; // Pilih gambar random

		await Wilykun.sendMessage(m.key.remoteJid, {
			image: { url: randomImageUrl },
			caption: `Halo @${displayName}, link channel/saluran terdeteksi dan telah dihapus. Mohon untuk tidak membagikan link tersebut lagi 🚫`,
			mentions: [m.sender],
			contextInfo: {
				mentionedJid: [m.sender, groupOwner],
				forwardingScore: 100,
				isForwarded: true,
				forwardedNewsletterMessageInfo: {
					newsletterJid: '120363312297133690@newsletter',
					newsletterName: 'Info Anime Dll 🌟',
					serverMessageId: 143
				}
			}
		}, { quoted: m });

		await Wilykun.sendMessage(m.key.remoteJid, { delete: { remoteJid: m.key.remoteJid, fromMe: false, id: m.key.id, participant: m.key.participant } });
		console.log(`Pesan mengandung link atau pesan dari channel dihapus dari @${m.sender.split('@')[0]} di grup ${m.key.remoteJid}`);
	}
}
