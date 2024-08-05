const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const app = express();

const token = process.env.TELEGRAM_BOT_TOKEN;
const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;
const unsplashApiUrl = 'https://api.unsplash.com/search/photos';

const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, '欢迎使用Unsplash壁纸机器人！请输入关键词搜索壁纸。');
});

bot.onText(/\/search (.+)/, (msg, match) => {
    const keyword = match[1];
    const url = `${unsplashApiUrl}?client_id=${unsplashApiKey}&query=${keyword}&per_page=10`;
    axios.get(url)
        .then((response) => {
            const photos = response.data.results;
            const photoUrls = photos.map((photo) => photo.urls.regular);
            bot.sendMediaGroup(msg.chat.id, photoUrls.map((url) => ({ type: 'photo', media: url })));
        })
        .catch((error) => {
            console.error(error);
            bot.sendMessage(msg.chat.id, '搜索失败，请稍后重试。');
        });
});

const hook = process.env.WEB_HOOK_URL;
const webhookUrl = `https://${hook}/${token}`;
bot.setWebHook(webhookUrl);

app.post(`/${token}`, (req, res) => {
    bot.processUpdate(req.body);
    res.sendStatus(200);
});

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`);
});


module.exports = app;
