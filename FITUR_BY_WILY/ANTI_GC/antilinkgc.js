import dotenv from 'dotenv';
import { images } from '../../NOTIFIKASI/Url_Images_Anime.js'; // Impor URL gambar

dotenv.config(); // Load .env file

const processedMessages = new Set();

export async function handleAntiWhatsAppLink(Wilykun, m, store) {
	const messageContent = m.message?.conversation || m.message?.extendedTextMessage?.text || '';
	const whatsappLinkPattern = /https:\/\/chat\.whatsapp\.com\/|chat\.whatsapp\.com\/|whatsapp\.com\//gi;

	// Function to recursively check message content for links
	const checkMessageContent = (content) => {
		if (whatsappLinkPattern.test(content)) {
			return true;
		}
		if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
			const quotedMessageContent = m.message.extendedTextMessage.contextInfo.quotedMessage.conversation || m.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage?.text || '';
			return checkMessageContent(quotedMessageContent);
		}
		return false;
	};

	if (process.env.ENABLE_ANTI_WHATSAPP_LINK === 'true' && checkMessageContent(messageContent) && !m.key.fromMe && !messageContent.includes('wa.me')) {
		if (processedMessages.has(m.key.id)) {
			return; // Skip if the message has already been processed
		}
		processedMessages.add(m.key.id);

		const participant = m.key.participant || m.key.remoteJid;
		const contact = store?.contacts?.[participant] || {};
		const displayName = contact.notify || contact.vname || contact.name || participant.split('@')[0];

		// Cek apakah pengirim adalah admin
		const groupMetadata = await Wilykun.groupMetadata(m.key.remoteJid);
		const groupOwner = groupMetadata.owner;
		const isAdmin = groupMetadata.participants.some(p => p.id === participant && p.admin);

		if (!isAdmin) {
			const randomImageUrl = images[Math.floor(Math.random() * images.length)]; // Pilih gambar random

			await Wilykun.sendMessage(m.key.remoteJid, { 
				image: { url: randomImageUrl },
				caption: `Halo @${displayName}, link group terdeteksi dan telah dihapus. Mohon untuk tidak membagikan link tersebut lagi 🚫`,
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
