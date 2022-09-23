const TIME_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const isValidTime = ({ hEstCierre }) => TIME_REGEX.test(hEstCierre);

module.exports = { isValidTime };
