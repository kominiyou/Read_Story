import { delay } from 'baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getWiseWords } from '../NOTIFIKASI/hehe.js'; // Impor fungsi getWiseWords

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 detik

export const handleGoodbyeMessage = async (Wilykun, update) => {
	const { id, participants, action } = update;
	if (action !== 'remove') return; // Hanya tangani peserta yang keluar

	let retries = 0;
	while (retries < MAX_RETRIES) {
		try {
			const groupMetadata = await Wilykun.groupMetadata(id);
			const groupOwner = groupMetadata.owner;
			const groupCreationDate = new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			const adminCount = groupMetadata.participants.filter(p => p.admin).length;
			const memberCount = groupMetadata.participants.length;

			const wiseWords = await getWiseWords();
			const randomWiseWord = wiseWords[Math.floor(Math.random() * wiseWords.length)];

			for (let participant of participants) {
				let ppUrl;
				try {
					ppUrl = await Wilykun.profilePictureUrl(participant, 'image');
				} catch {
					ppUrl = 'https://example.com/default-profile-picture.jpg'; // Gambar default jika tidak ada gambar profil
				}

				// Mengirim pesan selamat tinggal dengan gambar
				const goodbyeMessage = {
					image: { url: ppUrl },
					caption: `Selamat tinggal @${participant.split('@')[0]}! Terima kasih telah menjadi bagian dari grup ini. Semoga sukses di tempat yang baru! 👋
─
*{ Kata-kata dari saya, untuk orang yang meninggalkan group ini }*
${randomWiseWord} 💬
─
📢 *INFORMASI GROUP* 📢
PEMBUAT GROUP: *{ @${groupOwner.split('@')[0]} 👤 }*
GROUP DI BUAT PADA: *{ ${groupCreationDate} 📅 }*
JUMLAH ADMIN SAAT INI: *{ ${adminCount} 👮 }*
JUMLAH ANGGOTA SAAT INI: *{ ${memberCount} 👥 }*`,
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
				};

				await Wilykun.sendMessage(id, goodbyeMessage);
			}
			break; // Keluar dari loop jika berhasil mengirim pesan
		} catch (error) {
			if (error.data === 429) {
				console.error('Rate limit exceeded, retrying...', error);
				retries++;
				await delay(RETRY_DELAY);
			} else {
				console.error('Gagal mengirim pesan selamat tinggal:', error);
				break; // Keluar dari loop jika kesalahan bukan karena rate limit
			}
		}
	}
};
