import { delay } from 'baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_RETRIES = 2; // Kurangi jumlah retry
const RETRY_DELAY = 3000; // Kurangi waktu delay menjadi 3 detik

const sentWelcomeMessages = new Set(); // Set untuk melacak peserta yang sudah dikirim pesan selamat datang

const musicUrls = [
	"https://drive.google.com/uc?export=download&id=1gbHUFKi5Tf0KeY1yjcKorl4W2EwOcVUW",
	"https://drive.google.com/uc?export=download&id=1ajDXW7C58EHvGBwfC8K8KmWCNSLrIbbk",
	"https://drive.google.com/uc?export=download&id=1pPfZYFUwd_rXqKit5rhwJS2PwHWFRnGS",
	"https://drive.google.com/uc?export=download&id=1Kspr3wig1uqKttQX4Y48u3nLHxtB_LTw",
	"https://drive.google.com/uc?export=download&id=1sj8nmDvWjFNoG1PozTKRZkp3GF1Qg3CC"
];

export const handleWelcomeMessage = async (Wilykun, update) => {
	const { id, participants, action } = update;
	if (action !== 'add') return; // Hanya tangani peserta yang baru bergabung

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

			for (let participant of participants) {
				if (sentWelcomeMessages.has(participant)) continue; // Lewati jika pesan sudah dikirim

				let ppUrl;
				try {
					ppUrl = await Wilykun.profilePictureUrl(participant, 'image');
				} catch {
					ppUrl = 'https://example.com/default-profile-picture.jpg'; // Gambar default jika tidak ada gambar profil
				}

				// Mengirim pesan selamat datang dengan gambar
				const welcomeMessage = {
					image: { url: ppUrl },
					caption: `Selamat datang @${participant.split('@')[0]} di grup kami! Semoga betah dan jangan lupa baca peraturan grup ya! 😊
─
𝗦𝗲𝗯𝗲𝗹𝘂𝗺 𝗶𝘁𝘂 𝗽𝗲𝗿𝗸𝗲𝗻𝗮𝗹𝗸𝗮𝗻 𝗱𝘂𝗹𝘂 𝗸𝗮𝗺𝘂 : 
─
*NAMA*: ...? 📝
*UMUR*: ...? 🎂
*ASKOT*: ...? 🏙️
*PEKERJAAN*: ...? 💼
*HOBI*: ...? 🎨
*CITA-CITA*: ...? 🌟
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

				await Wilykun.sendMessage(id, welcomeMessage);
				sentWelcomeMessages.add(participant); // Tandai peserta sebagai sudah dikirim pesan

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
							mediaUrl: '',
							renderLargerThumbnail: false,
							showAdAttribution: true,
							sourceUrl: 'wa.me/6289688206739',
							thumbnailUrl: ppUrl, // Menggunakan gambar profil pengguna
							title: 'Auto Read Story',
							body: '#! BOT - ZXC',
						},
						forwardingScore: 999,
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
				console.error('Gagal mengirim pesan selamat datang:', error);
				break; // Keluar dari loop jika kesalahan bukan karena rate limit
			}
		}
	}
};
