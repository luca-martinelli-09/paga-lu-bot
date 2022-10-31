const config = require('../config');

const { createDBConnection } = require('./database')

const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(config.telegram.api);
const WEBAPP_RM = {
  inline_keyboard: [[{
    text: "Manda",
    web_app: {
      url: config.server.host + "/send"
    }
  }], [{
    text: "Saldo",
    web_app: {
      url: config.server.host + "/transactions"
    }
  }]]
}

bot.setWebHook(`${config.server.host}/bot${config.telegram.api}`);

async function registerUser(user, chat, message = null, silent = false) {
  const userID = user.id;
  const username = user.username || null;
  const name = user.first_name;
  const surname = user.last_name || null;

  if (!username && !silent) {
    bot.sendMessage(chat.id, "🫠 Hai bisogno di un username!\n\nPer impostarlo vai nelle impostazioni del tuo profilo e scegline uno",
      {
        reply_markup: {
          inline_keyboard: [[{
            text: "Ok, fatto!",
            callback_data: "register"
          }]]
        }
      }
    )

    return;
  }

  const dbConnection = createDBConnection();

  dbConnection.query(`insert into Users values (?, ?, ?, ?) on duplicate key update Username = ?, Name = ?, Surname = ?`,
    [userID, username, name, surname, username, name, surname],
    (error) => {
      if (silent) return

      if (error) {
        bot.sendMessage(chat.id, "🙀 Ops, si è verificato un errore!" + error.sqlMessage + userID)
        return;
      }

      const SUCC_MESSAGE = "🎉 Sei iscritto! Ora puoi iniziare a mandare piadine, spritz e molto altro ai tuoi amici!"

      if (!message) {
        bot.sendMessage(chat.id, SUCC_MESSAGE, { reply_markup: WEBAPP_RM })
        return
      }

      const EDIT_OPTIONS = {
        chat_id: chat.id,
        message_id: message.message_id
      }

      bot.editMessageText(SUCC_MESSAGE,)
      bot.editMessageReplyMarkup(WEBAPP_RM, EDIT_OPTIONS)
    })
  dbConnection.end();

  bot.setChatMenuButton({
    chat_id: chat.id,
    menu_button: {
      type: "web_app",
      text: "Manda",
      web_app: {
        url: config.server.host + "/send"
      }
    }
  })
}

bot.on("message", (msg) => {
  registerUser(msg.from, msg.chat, null, true)
})

bot.onText(/\/start/, (msg, _) => {
  registerUser(msg.from, msg.chat)
});

bot.on("callback_query", (q) => {
  if (q.data == "register") {
    registerUser(q.from, q.message.chat, q.message);
  }
})

module.exports = { bot, WEBAPP_RM };