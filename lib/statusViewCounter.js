import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'DATA/Jumlah_Lihat_Status_Orang.json');

let statusViewCount = 0;
let noReactViewCount = 0; // Tambahkan ini untuk menghitung jumlah status yang dilihat tanpa reaksi

// Muat jumlah status yang dilihat dari file saat inisialisasi
if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    statusViewCount = data.statusViewCount || 0;
    noReactViewCount = data.noReactViewCount || 0; // Muat jumlah status yang dilihat tanpa reaksi
}

/**
 * Mengupdate jumlah status yang dilihat.
 * @param {number} count - Jumlah status yang dilihat.
 */
export function updateStatusViewCount(count) {
    statusViewCount = count;
    saveStatusViewCount();
}

/**
 * Mengambil jumlah status yang dilihat.
 * @returns {number} - Jumlah status yang dilihat.
 */
export function getStatusViewCount() {
    return statusViewCount;
}

/**
 * Mengupdate jumlah status yang dilihat tanpa reaksi.
 * @param {number} count - Jumlah status yang dilihat tanpa reaksi.
 */
export function updateNoReactViewCount(count) {
    noReactViewCount = count;
    saveStatusViewCount();
}

/**
 * Mengambil jumlah status yang dilihat tanpa reaksi.
 * @returns {number} - Jumlah status yang dilihat tanpa reaksi.
 */
export function getNoReactViewCount() {
    return noReactViewCount;
}

/**
 * Menyimpan jumlah status yang dilihat ke file.
 */
function saveStatusViewCount() {
    const data = { statusViewCount, noReactViewCount };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

/**
 * Menambahkan jumlah status yang dilihat.
 */
export function incrementStatusViewCount() {
    statusViewCount += 1; // Increment the statusViewCount variable
    saveStatusViewCount(); // Save the updated count
}

/**
 * Menambahkan jumlah status yang dilihat tanpa reaksi.
 */
export function incrementNoReactViewCount() {
    noReactViewCount += 1; // Increment the noReactViewCount variable
    saveStatusViewCount(); // Save the updated count
}
