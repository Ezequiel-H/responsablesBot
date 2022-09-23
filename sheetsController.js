/* eslint-disable max-len */
const { google } = require('googleapis');

require('dotenv').config();

async function getSheetValues(range) {
  const service = google.sheets({ version: 'v4', auth: process.env.SHEETS_API_KEY });
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range,
    });
    return result.data.values;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

module.exports = { getSheetValues };
