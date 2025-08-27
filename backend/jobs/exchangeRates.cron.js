const cron = require('node-cron');
const { updateVehicleRates } = require('../services/exchange.service');

// Schedule: Every Monday at 00:00 (weekly)
cron.schedule('0 0 * * MON', async () => {
  console.log('Running weekly exchange rate update...');
  await updateVehicleRates();
});