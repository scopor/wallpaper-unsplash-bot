require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 替换为您的Telegram Bot Token
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Unsplash API配置
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const WALLPAPER_API_URL = 'https://api.unsplash.com/photos/random?query={query}&count=5';

// 处理/start命令
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '欢迎使用壁纸机器人！请发送您想要的壁纸主题。');
});

// 处理用户输入
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const query = msg.text;

    try {
        const response = await axios.get(WALLPAPER_API_URL.replace('{query}', query), {
            headers: {
                Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`
            }
        });

        const photos = response.data;
        if (photos.length > 0) {
            photos.forEach(photo => {
                bot.sendPhoto(chatId, photo.urls.regular, { caption: `壁纸主题: ${query}` });
            });
        } else {
            bot.sendMessage(chatId, '未找到相关壁纸，请尝试其他主题。');
        }
    } catch (error) {
        console.error(error);
        bot.sendMessage(chatId, '获取壁纸时出错，请稍后再试。');
    }
});
