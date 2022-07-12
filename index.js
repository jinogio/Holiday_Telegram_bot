const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const flags = require("country-code-emoji");

const { TELEGRAM_TOKEN, ABSTRACT_API_KEY } = process.env;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

const getTodayHoliday = async (country) => {
  try {
    const now = new Date();
    const { data } = await axios.get(`https://holidays.abstractapi.com/v1/`, {
      params: {
        api_key: ABSTRACT_API_KEY,
        country,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
      },
    });

    return (
      data.map(({ name }) => name).join("\n") ||
      `No holidays for today in ${flags.countryCodeEmoji(country)}`
    );
  } catch (error) {
    console.log(error);
    return "Ooops";
  }
};

bot.on("message", (msg) => {
  const {
    chat: { id },
  } = msg;

  if (msg.text === "/start") {
    bot.sendMessage(id, "Choose Country ...", {
      reply_markup: {
        keyboard: [
          [
            flags.countryCodeEmoji("GE"),
            flags.countryCodeEmoji("RU"),
            flags.countryCodeEmoji("TR"),
            flags.countryCodeEmoji("UA"),
            flags.countryCodeEmoji("US"),
            flags.countryCodeEmoji("CA"),
            flags.countryCodeEmoji("GB"),
            flags.countryCodeEmoji("AU"),
          ],
        ],
        resize_keyboard: true,
        one_time_keyboard: true,
        force_reply: true,
      },
    });
  } else {
    const country = flags.emojiCountryCode(msg.text);
    getTodayHoliday(country).then((holidays) => bot.sendMessage(id, holidays));
  }
});
