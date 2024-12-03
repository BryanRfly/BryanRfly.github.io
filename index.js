const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Token bot Telegram Anda
const TOKEN = '2139854033:AAG4vrETvCRHLm_3onInkDldkvElPbPDqLg';
const bot = new TelegramBot(TOKEN, { polling: true });

// File untuk menyimpan data pesan
const DATA_FILE = 'data.json';

// Inisialisasi file jika belum ada
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Fungsi untuk menyimpan pesan ke file
function saveMessage(message) {
  const currentData = JSON.parse(fs.readFileSync(DATA_FILE));
  currentData.push(message);
  fs.writeFileSync(DATA_FILE, JSON.stringify(currentData, null, 2));
}

// Fungsi untuk mendapatkan semua pesan
function getAllMessages() {
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

// Fungsi untuk menghapus semua pesan
function clearMessages() {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

// Bot menerima pesan dari pengguna
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const userMessage = msg.text.toLowerCase().trim();

  if (userMessage === 'clear message') {
    // Hapus semua pesan
    clearMessages();
    
    // Kirim balasan ke pengguna
    bot.sendMessage(chatId, 'Semua pesan telah dihapus dari database.');
  } else {
    // Simpan pesan ke file
    const messageData = {
      username: msg.from.username || msg.from.first_name,
      text: userMessage,
      date: new Date().toLocaleString()
    };

    saveMessage(messageData);

    // Kirim balasan ke pengguna
    bot.sendMessage(chatId, 'Pesan Anda telah disimpan dan akan ditampilkan di website.');
  }
});

// Inisialisasi Express untuk website
const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint API untuk mendapatkan semua pesan
app.get('/api/messages', (req, res) => {
  res.json(getAllMessages());
});

// Endpoint API untuk menghapus semua pesan
app.post('/api/clear', (req, res) => {
  clearMessages();
  res.json({ success: true, message: 'Semua pesan telah dihapus.' });
});

// Jalankan server Express
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
