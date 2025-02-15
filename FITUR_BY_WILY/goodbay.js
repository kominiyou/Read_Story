import { delay } from 'baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import { getWiseWords } from '../NOTIFIKASI/hehe.js'; // Impor fungsi getWiseWords
import { musicUrls } from '../MP3_URL/music_url.js'; // Impor URL musik
import dotenv from 'dotenv'; // Tambahkan ini untuk mengimpor dotenv

dotenv.config(); // Load .env file

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 detik

function getUptimeBot() {
	const uptime = os.uptime();
	const hours = Math.floor(uptime / 3600);
	const minutes = Math.floor((uptime % 3600) / 60);
	return `${hours} jam ${minutes} menit`;
}

function formatDate() {
	const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
	return new Date().toLocaleDateString('id-ID', options).replace(/\./g, '');
}

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
						businessMessageForwardInfo: {
							businessOwnerJid: Wilykun.user.id
						},
						forwardedNewsletterMessageInfo: {
							newsletterJid: '120363312297133690@newsletter',
							serverMessageId: null,
							newsletterName: 'Info Anime Dll 🌟'
						}
					}
				};

				await Wilykun.sendMessage(id, goodbyeMessage);

				// Mengirim pesan audio dengan URL musik random
				const randomMusicUrl = musicUrls[Math.floor(Math.random() * musicUrls.length)];
				const audioMessage = {
					audio: { url: randomMusicUrl },
					mimetype: 'audio/mpeg',
					ptt: false,
					contextInfo: {
						externalAdReply: {
							containsAutoReply: true,
							mediaType: 1,
							mediaUrl: 'https://wa.me/6289688206739',
							renderLargerThumbnail: false,
							showAdAttribution: true,
							sourceUrl: 'https://wa.me/6289688206739',
								thumbnailUrl: ppUrl, // Menggunakan gambar profil pengguna
							title: `${formatDate()} 📆`,
							body: `Runtime: ${getUptimeBot()} ⏱️`,
						},
						forwardingScore: 100,
						isForwarded: true,
						mentionedJid: [participant],
						businessMessageForwardInfo: {
							businessOwnerJid: Wilykun.user.id
						},
						forwardedNewsletterMessageInfo: {
							newsletterJid: '120363312297133690@newsletter',
							serverMessageId: null,
							newsletterName: 'Info Anime Dll 🌟'
						}
					}
				};

				await Wilykun.sendMessage(id, audioMessage);
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

if (process.env.HANDLE_ERRORS === 'true') {
	process.on('uncaughtException', function (err) {
		let e = String(err);
		if (e.includes("Socket connection timeout")) return;
		if (e.includes("item-not-found")) return;
		if (e.includes("rate-overlimit")) return;
		if (e.includes("Connection Closed")) return;
		if (e.includes("Timed Out")) return;
		if (e.includes("Value not found")) return;
		console.log('Caught exception: ', err);
	});

	process.on('unhandledRejection', console.error);
}
