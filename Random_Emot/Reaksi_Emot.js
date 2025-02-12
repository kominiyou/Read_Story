import { jidNormalizedUser } from 'baileys';
import { sendTelegram } from '../lib/function.js';
import { emojis } from './kumpulaEmot.js';
import chalk from 'chalk'; // Tambahkan ini untuk mengimpor chalk
import { incrementStatusViewCount, incrementNoReactViewCount } from '../lib/statusViewCounter.js'; // Tambahkan ini untuk mengimpor fungsi incrementStatusViewCount dan incrementNoReactViewCount

// Set untuk melacak story yang sudah diberi reaksi
const reactedStories = new Set();

/**
 * Memilih dua warna acak dari daftar warna yang didukung oleh chalk.
 * @param {string} text - Teks yang akan diwarnai.
 * @returns {string} - Teks yang diwarnai dengan dua warna acak.
 */
function randomColor(text) {
	const colors = [
		'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white',
		'gray', 'redBright', 'greenBright', 'yellowBright', 'blueBright',
		'magentaBright', 'cyanBright', 'whiteBright'
	];
	const randomColor1 = colors[Math.floor(Math.random() * colors.length)];
	const randomColor2 = colors[Math.floor(Math.random() * colors.length)];
	return chalk[randomColor1](chalk[randomColor2](text));
}

/**
 * Fungsi untuk mengirim reaksi emoji secara otomatis.
 * @param {import('baileys').WASocket} Wilykun - Instance WASocket.
 * @param {import('baileys').WAMessage} m - Pesan yang diterima.
 */
export async function autoReactStatus(Wilykun, m) {
	// Daftar emoji yang akan digunakan untuk reaksi
	const emojiList = process.env.REACT_STATUS ? process.env.REACT_STATUS.split(',').map(e => e.trim()).filter(Boolean) : emojis;

	// Daftar warna yang didukung
	const colors = ['\x1b[31m', '\x1b[32m', '\x1b[33m', '\x1b[34m', '\x1b[35m', '\x1b[36m'];

	if (emojiList.length && m.key && m.key.id) {
		// Memilih emoji secara acak dari daftar
		const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
		// Memilih warna secara acak dari daftar
		const colorEmoji = colors[Math.floor(Math.random() * colors.length)];
		const colorParticipant = colors[Math.floor(Math.random() * colors.length)];
		const colorName = colors[Math.floor(Math.random() * colors.length)];
		const colorType = colors[Math.floor(Math.random() * colors.length)];

		// Cek apakah story sudah diberi reaksi
		const storyId = m.key.id;
		const participantId = m.key.participant || m.key.remoteJid; // Pastikan participantId didefinisikan

		if (reactedStories.has(storyId)) {
			return; // Jika sudah, tidak perlu memberi reaksi lagi
		}

		// Tambahkan logika untuk melihat status dengan atau tanpa reaksi
		let shouldReact;
		if (process.env.AUTO_READ_STORY === 'true') {
			shouldReact = Math.random() < 0.5;
		} else if (process.env.AUTO_READ_STORY === 'false') {
			shouldReact = true;
		} else if (process.env.AUTO_READ_STORY === 'suram') {
			shouldReact = false;
		}

		const participantName = Wilykun.getName(participantId);
		const messageType = m.message.imageMessage ? 'Gambar' :
							m.message.videoMessage ? 'Video' :
							m.message.extendedTextMessage && m.message.extendedTextMessage.contextInfo && m.message.extendedTextMessage.contextInfo.quotedMessage ? 'Berbagi' :
							m.message.conversation ? 'Teks' : 'Teks';

		if (shouldReact) {
			await Wilykun.sendMessage(
				'status@broadcast',
				{
					react: { key: m.key, text: emoji },
				},
				{
					statusJidList: [jidNormalizedUser(Wilykun.user.id), jidNormalizedUser(participantId)],
				}
			);

			// Tambahkan story ke set reactedStories
			reactedStories.add(storyId);

			console.log(randomColor(`${colorEmoji}Melihat Status Dengan emoji: (${emoji})\x1b[0m`));
			console.log(randomColor(`${colorParticipant}Nomer: (${participantId.split('@')[0]})\x1b[0m`));
			console.log(randomColor(`${colorName}Nama: (${participantName})\x1b[0m`));
			console.log(randomColor(`${colorType}Tipe: (${messageType})\x1b[0m`));
			console.log(randomColor('------------------------------------------------------------'));

			incrementStatusViewCount(); // Tambahkan ini untuk menambah jumlah status yang dilihat dengan reaksi
		} else {
			console.log(randomColor(`Melihat Status tanpa emoji\x1b[0m`));
			console.log(randomColor(`${colorParticipant}Nomer: (${participantId.split('@')[0]})\x1b[0m`));
			console.log(randomColor(`${colorName}Nama: (${participantName})\x1b[0m`));
			console.log(randomColor(`${colorType}Tipe: (${messageType})\x1b[0m`));
			console.log(randomColor('------------------------------------------------------------'));

			incrementNoReactViewCount(); // Tambahkan ini untuk menambah jumlah status yang dilihat tanpa reaksi
		}
	}

	// Mengirim pesan ke Telegram jika token dan ID Telegram tersedia
	if (process.env.TELEGRAM_TOKEN && process.env.ID_TELEGRAM) {
		const participantId = m.key.participant || m.key.remoteJid; // Pastikan participantId didefinisikan di sini juga
		if (m.message.imageMessage || m.message.videoMessage) {
			let media = await Wilykun.downloadMediaMessage(m);
			let caption = `Dari: https://wa.me/${participantId.split('@')[0]} (${Wilykun.getName(participantId)})${m.message.conversation ? `\n\n${m.message.conversation}` : ''}`;
			await sendTelegram(process.env.ID_TELEGRAM, media, { type: /audio/.test(m.message.mimetype) ? 'document' : '', caption });
		} else {
			await sendTelegram(process.env.ID_TELEGRAM, `Dari: https://wa.me/${participantId.split('@')[0]} (${Wilykun.getName(participantId)})\n\n${m.message.conversation}`);
		}
	}
}

/**
 * Fungsi untuk memeriksa dan memberi reaksi pada status yang belum terbaca.
 * @param {import('baileys').WASocket} Wilykun - Instance WASocket.
 */
export async function checkUnreadStatuses(Wilykun) {
	const statuses = await Wilykun.fetchStatusUpdates();
	for (const status of statuses) {
		if (!reactedStories.has(status.key.id)) {
			await autoReactStatus(Wilykun, status);
		}
	}
}