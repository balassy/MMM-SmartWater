/* global Module, moment */

/* Magic Mirror Module: MMM-SmartWater (https://github.com/balassy/MMM-SmartWater)
 * By György Balássy (https://www.linkedin.com/in/balassy)
 * MIT Licensed.
 */

Module.register('MMM-SmartWater', {
  defaults: {
    sensorId: null,
    icon: 'water',
    showMore: true,
    minOkDistanceInCm: 50,
    minWarningDistanceInCm: 30
  },

  requiresVersion: '2.1.0',

  getScripts() {
    return [
      'moment.js'
    ];
  },

  getStyles() {
    return [
      'MMM-SmartWater.css',
      'font-awesome.css',
      'font-awesome5.css'
    ];
  },

  getTranslations() {
    return {
      en: 'translations/en.json',
      hu: 'translations/hu.json'
    };
  },

  start() {
    this.viewModel = null;
    this._initCommunication();
  },

  getDom() {
    const wrapper = document.createElement('div');

    if (this.viewModel) {
      const firstLineEl = document.createElement('div');

      if (this.config.icon) {
        const iconEl = document.createElement('span');
        iconEl.classList = `symbol fa fa-${this.config.icon}`;
        firstLineEl.appendChild(iconEl);
      }

      if (this.viewModel.currentDistanceInCm) {
        const level = this._getLevel(this.viewModel.currentDistanceInCm);
        firstLineEl.classList = `${level}-level`;

        const distanceEl = document.createElement('span');
        distanceEl.classList = 'distance';
        distanceEl.innerHTML = `${this.viewModel.currentDistanceInCm} cm`;
        firstLineEl.appendChild(distanceEl);

        if (level === 'alert') {
          const flagEl = document.createElement('span');
          flagEl.classList = 'fa fa-swimming-pool level';
          firstLineEl.appendChild(flagEl);
        }
      }

      wrapper.appendChild(firstLineEl);

      if (this.config.showMore) {
        const secondLineEl = document.createElement('div');
        secondLineEl.classList = 'more dimmed small';

        const timestampIconEl = document.createElement('span');
        timestampIconEl.classList = 'fa fa-refresh';
        secondLineEl.appendChild(timestampIconEl);

        const timestampEl = document.createTextNode(this._formatTimestamp(this.viewModel.timestamp));
        secondLineEl.appendChild(timestampEl);

        if (this.viewModel.lastDistanceInCm != null) {
          const diffInCm = this.viewModel.lastDistanceInCm - this.viewModel.currentDistanceInCm;
          const isRising = diffInCm > 0;

          const diffIconEl = document.createElement('span');
          diffIconEl.classList = isRising ? 'fa fa-arrow-up' : 'fa fa-arrow-down';
          secondLineEl.appendChild(diffIconEl);

          const diffPrefix = isRising ? '+' : '';
          const diffEl = document.createTextNode(`${diffPrefix}${diffInCm} cm`);
          secondLineEl.appendChild(diffEl);
        }

        wrapper.appendChild(secondLineEl);
      }
    } else {
      const loadingEl = document.createElement('span');
      loadingEl.innerHTML = this.translate('LOADING');
      loadingEl.classList = 'dimmed small';
      wrapper.appendChild(loadingEl);
    }

    return wrapper;
  },

  socketNotificationReceived(notificationName, payload) {
    if (notificationName === 'MMM-SmartWater.VALUE_RECEIVED' && payload) {
      if (!this.config.sensorId || (this.config.sensorId && this.config.sensorId === payload.sensorId)) {
        const lastDistanceInCm = this.viewModel?.currentDistanceInCm || null;

        this.viewModel = {
          currentDistanceInCm: payload.distanceInCm,
          lastDistanceInCm,
          timestamp: Date.now()
        };

        this.updateDom();
      }
    }
  },

  _initCommunication() {
    this.sendSocketNotification('MMM-SmartWater.INIT', {
      sensorId: this.config.sensorId
    });
  },

  _formatTimestamp(timestamp) {
    return moment(timestamp).format('HH:mm');
  },

  _getLevel(distanceInCm) {
    return distanceInCm > this.config.minOkDistanceInCm
      ? 'ok'
      : distanceInCm > this.config.minWarningDistanceInCm
        ? 'warning'
        : 'alert';
  }
});
