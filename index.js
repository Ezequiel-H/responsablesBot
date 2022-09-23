const { Telegraf } = require('telegraf');
const {
  getProximosCierresByZone, getSinInformacionByZone, ponerMenuInicial, defaultMessage,
} = require('./botController');
const { COMANDOS, BOTONES } = require('./comands');

require('dotenv').config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

bot.help((ctx) => ctx.reply('Ayuda!'));

// PROXIMOS CIERRES

bot.command(COMANDOS.PROX_CIERRES, getProximosCierresByZone);
bot.hears(BOTONES.PROX_CIERRES, getProximosCierresByZone);

// SIN INFORMACION

bot.command(COMANDOS.SIN_INFO, getSinInformacionByZone);
bot.hears(BOTONES.SIN_INFO, getSinInformacionByZone);

// BOT FUNCTIONS

bot.start(ponerMenuInicial);
bot.on('text', defaultMessage);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
