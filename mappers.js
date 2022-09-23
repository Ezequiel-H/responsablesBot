/* eslint-disable max-len */
/* eslint-disable no-nested-ternary */
const { ESTADO_INSTITUCIONES } = require('./constants');

const getValidTimeStamp = (timeStamp) => {
  const date = new Date();
  const formatedTimestamp = timeStamp.split(':');
  date.setUTCHours(formatedTimestamp[0], formatedTimestamp[1], 0);
  return date;
};

const zonaMapper = (zona) => ({
  nombre: zona[0],
  direccion: `${zona[2]} ${zona[3]}`,
  estado: zona[12] ? ESTADO_INSTITUCIONES.CERRADO : zona[6]
    ? ESTADO_INSTITUCIONES.ABIERTO : ESTADO_INSTITUCIONES.SIN_INFORMACION,
  hApertura: zona[6],
  hEstCierre: zona[8],
  publico: zona[7],
  consigna: zona[9] && zona[9].toString() !== '0',
});

const mapInstitutionToCloseTime = (institutions) => {
  let response = '';
  let lastTime = new Date();
  lastTime.setUTCHours(0, 0, 0);
  institutions.forEach(({
    hEstCierre, nombre, publico, consigna,
  }) => {
    const nuevaFecha = new Date(hEstCierre);
    if (nuevaFecha > lastTime) {
      response = `${response}\n\n---------------- ${nuevaFecha.getHours() + 3}:${nuevaFecha.getMinutes() === 0 ? '00' : nuevaFecha.getMinutes()} ----------------\n- ${nombre}: ${publico} pers. ${consigna ? '👮' : ''}`;
      lastTime = nuevaFecha;
    } else {
      response = `${response}\n- ${nombre}: ${publico} pers. ${consigna ? '👮' : ''}`;
    }
  });
  return response;
};
const mapInstitutionInvalidCloseTime = (institutions) => {
  let response = 'Los horarios de cierre de las siguientes instituciones no pudieron ser interpretados\n';
  institutions.forEach(({ hEstCierre, nombre, publico }) => {
    response = `${response}\n- ${nombre} \n      Hora cierre: ${hEstCierre || 'Sin informacion'}\n      Publico: ${publico} pers.`;
  });
  return response;
};

const mapInstitutionsWithoutInfo = (institutions) => {
  let response = 'Las siguientes instituciones no tienen aperturas ni cierres cargadas:\n';
  institutions.forEach(({ nombre, direccion }) => {
    response = `${response}\n- ${nombre} (${direccion})`;
  });
  return response;
};

module.exports = {
  zonaMapper, getValidTimeStamp, mapInstitutionToCloseTime, mapInstitutionInvalidCloseTime, mapInstitutionsWithoutInfo,
};
