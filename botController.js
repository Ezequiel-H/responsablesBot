/* eslint-disable no-unused-expressions */
/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
const { Markup } = require('telegraf');
const { BOTONES } = require('./comands');
const { ESTADO_INSTITUCIONES } = require('./constants');
const {
  zonaMapper, getValidTimeStamp, mapInstitutionToCloseTime, mapInstitutionInvalidCloseTime, mapInstitutionsWithoutInfo,
} = require('./mappers');
const { getSheetValues } = require('./sheetsController');
const { isValidTime } = require('./utils');

const ponerMenu = (context, mensaje) => context.reply(mensaje, Markup
  .keyboard([[BOTONES.PROX_CIERRES, BOTONES.SIN_INFO]])
  .oneTime()
  .resize());

async function getZonaName(ctx) {
  const userId = ctx.update.message.from.id;
  const responsables = await getSheetValues('RESPONSABLES!B2:C');
  const responsable = responsables.filter((resp) => resp[1] === userId.toString());
  // eslint-disable-next-line no-throw-literal
  if (responsable) { responsable[0][0]; }
}

const getZona = async (ctx) => {
  const zonaName = await getZonaName(ctx);
  const zonaInfo = await getSheetValues(`${zonaName}!A2:O`);
  return zonaInfo.map(zonaMapper);
};

const getZonaAbiertas = async (ctx) => {
  const zonaInfo = await getZona(ctx);
  return zonaInfo.filter((institucion) => institucion.estado === ESTADO_INSTITUCIONES.ABIERTO);
};

const getZonaSinInformacion = async (ctx) => {
  const zonaInfo = await getZona(ctx);
  return zonaInfo.filter((institucion) => institucion.estado === ESTADO_INSTITUCIONES.SIN_INFORMACION);
};

const getProximosCierresByZone = async (ctx) => {
  try {
    const zonaInfo = await getZonaAbiertas(ctx);
    const filteredByValidTimestamp = zonaInfo.filter(isValidTime);
    const validTimeStamps = filteredByValidTimestamp.map((institucion) => ({ ...institucion, hEstCierre: getValidTimeStamp(institucion.hEstCierre) }));
    const invalidTimeStamps = zonaInfo.filter((institucion) => !isValidTime(institucion));
    validTimeStamps.sort((a, b) => (a.hEstCierre < b.hEstCierre ? -1 : a.hEstCierre > b.hEstCierre ? 1 : 0));
    const responseValid = mapInstitutionToCloseTime(validTimeStamps);
    const responseInvalid = mapInstitutionInvalidCloseTime(invalidTimeStamps);

    if (responseValid) {
      await ponerMenu(ctx, responseValid);
    }
    if (invalidTimeStamps.length) {
      await ponerMenu(ctx, responseInvalid);
    }
    if (!responseValid && !invalidTimeStamps.length) {
      await ponerMenu(ctx, 'No hay instituciones abiertas');
    }
  } catch (e) {
    ctx.reply('No tenes acceso al bot. En caso de que requieras acceso, por favor pedile a tu responsable que se comunique con la base');
    console.error(e);
  }
};

const getSinInformacionByZone = async (ctx) => {
  try {
    const zonaInfo = await getZonaSinInformacion(ctx);
    const responseSinInformacion = mapInstitutionsWithoutInfo(zonaInfo);
    ponerMenu(ctx, responseSinInformacion || 'No hay instituciones sin informacion');
  } catch (e) {
    ctx.reply('No tenes acceso al bot. En caso de que requieras acceso, por favor pedile a tu responsable que se comunique con la base');
    console.error(e);
  }
};

const ponerMenuInicial = (ctx) => ponerMenu(ctx, 'Bienvenido al bot para responsables!');
const defaultMessage = (ctx) => ponerMenu(ctx, 'No entiend que quieres decir, prueba con alguno de estos comandos!');

module.exports = {
  getZonaName, getProximosCierresByZone, getSinInformacionByZone, ponerMenuInicial, defaultMessage,
};
