import TelegramBot from 'node-telegram-bot-api';
import fetch from 'node-fetch';

// 从环境变量中获取Token和Unsplash API密钥
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// 创建一个Telegram Bot实例
const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });

// 设置Webhook
async function setWebhook() {
    const WEBHOOK_URL = `https://your-vercel-deployment-url/webhook`; // 替换为您的Vercel部署URL
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
    await fetch(url);
}

// 处理用户消息
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userInput = msg.text;

    // 根据用户输入获取壁纸
    const wallpaperUrl = await getWallpaper(userInput);

    if (wallpaperUrl) {
        await bot.sendPhoto(chatId, wallpaperUrl, { caption: '这是您请求的壁纸！' });
    } else {
        await bot.sendMessage(chatId, '未找到相关壁纸，请尝试其他关键词。');
    }
});

// 获取壁纸的函数
async function getWallpaper(query) {
    const response = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=${UNSPLASH_ACCESS_KEY}`);
    const data = await response.json();
    return data.urls?.full; // 返回壁纸的URL
}

// 启动应用并设置Webhook
setWebhook().then(() => {
    console.log('Webhook已设置');
});
