import dotenv from 'dotenv';

dotenv.config(); // Load .env file

export async function handleAntiForwardedNewsletter(Wilykun, m) {
	if (process.env.ENABLE_ANTI_FORWARDED_NEWSLETTER === 'true' && !m.key.fromMe && (m.message?.extendedTextMessage?.contextInfo?.forwardedNewsletterMessageInfo || m.message?.newsletterName)) {
		const groupMetadata = await Wilykun.groupMetadata(m.key.remoteJid);
		const groupOwner = groupMetadata.owner;

		await Wilykun.sendMessage(m.key.remoteJid, {
			text: `@${m.sender.split('@')[0]}, pesan dari newsletter terdeteksi dan dihapus.`,
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
		console.log(`Pesan mengandung fitur newsletter dihapus dari @${m.sender.split('@')[0]} di grup ${m.key.remoteJid}`);
	}
}
