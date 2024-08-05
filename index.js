const TelegramBot = require('node-telegram-bot-api');
const { createApi } = require('unsplash-js');

// 从环境变量读取 Token 和 Access Key
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

// 检查环境变量是否设置
if (!TELEGRAM_BOT_TOKEN || !UNSPLASH_ACCESS_KEY) {
    console.error("请设置 BOT_TOKEN 和 UNSPLASH_ACCESS_KEY 环境变量！");
    process.exit(1);
} else {
    console.log(TELEGRAM_BOT_TOKEN);
    console.log(UNSPLASH_ACCESS_KEY);
}

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: true });
const unsplash = createApi({ accessKey: UNSPLASH_ACCESS_KEY });

bot.on('message', async (msg) => {
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
});

console.log('机器人已启动 🚀');
