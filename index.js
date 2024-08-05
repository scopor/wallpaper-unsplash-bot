const TelegramBot = require('node-telegram-bot-api');
const { createApi } = require('unsplash-js');
const express = require('express');

const app = express();

// 从环境变量读取 Token 和 Access Key
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// 检查环境变量是否设置
if (!TELEGRAM_BOT_TOKEN || !UNSPLASH_ACCESS_KEY) {
    console.error("请设置 TELEGRAM_BOT_TOKEN 和 UNSPLASH_ACCESS_KEY 环境变量！");
    process.exit(1);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN);
const unsplash = createApi({ accessKey: UNSPLASH_ACCESS_KEY });

// 设置 Webhook
const url = `https://wallpaper-unsplash-bot.vercel.app/${TELEGRAM_BOT_TOKEN}`; // 替换为你的 Vercel URL
bot.setWebHook(url);

app.use(express.json());

// 处理根路径的 GET 请求
app.get('/', (req, res) => {
  res.send('欢迎使用 Telegram 图片搜索机器人！Telegram 搜索 Wallpapaer-unsplash-bot 机器人，点击开始，输入 /photos xxx 返回 5 张 xxx 相关的照片。');
});

app.post(`/${TELEGRAM_BOT_TOKEN}`, async (req, res) => {
    const msg = req.body.message;
    const chatId = msg.chat.id;
    const messageText = msg.text;

    if (messageText.startsWith('/photos')) {
        const query = messageText.replace('/photos ', '');

        try {
            const result = await unsplash.search.getPhotos({
                query: query,
                page: 1,
                perPage: 5,
            });

            if (result.response.results.length > 0) {
                result.response.results.forEach((photo) => {
                    bot.sendPhoto(chatId, photo.urls.small, {
                        caption: `Photo by ${photo.user.name} on Unsplash`,
                    });
                });
            } else {
                bot.sendMessage(chatId, '没有找到相关的图片 😔');
            }
        } catch (error) {
            console.error('获取图片出错:', error);
            bot.sendMessage(chatId, '获取图片出错，请稍后再试 🙏');
        }
    } else {
        bot.sendMessage(
            chatId,
            '请使用 `/photos <关键词>` 来搜索图片，例如 `/photos 猫咪` 😊'
        );
    }

    res.sendStatus(200); // 发送响应以确认接收到消息
});

// 导出处理函数
module.exports = app;
