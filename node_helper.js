const bodyParser = require('body-parser');
const NodeHelper = require('node_helper'); // eslint-disable-line import/no-unresolved

module.exports = NodeHelper.create({
  start() {
    this._initHandler();
  },

  socketNotificationReceived(notificationName, payload) {
    if (notificationName === 'MMM-SmartWater.INIT') {
      console.log(`MMM-SmartWater Node helper: Init notification received from module for sensor "${payload.sensorId}".`); // eslint-disable-line no-console
    }
  },

  _initHandler() {
    this.expressApp.use(bodyParser.json());
    this.expressApp.post('/smart-water', this._onValueReceived.bind(this));
  },

  _onValueReceived(req, res) {
    const params = req.body;

    const payload = {
      sensorId: params.sensorId,
      distanceInCm: params.distanceInCm
    };

    this.sendSocketNotification('MMM-SmartWater.VALUE_RECEIVED', payload);

    res.sendStatus(200);
  }
});
