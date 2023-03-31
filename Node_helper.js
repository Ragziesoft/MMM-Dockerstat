const ping = require('ping');
const SSH = require('simple-ssh');
const NodeHelper = require('node_helper');
const Fontawesome = require('fontawesome');
const Logger = require('./Logger.js');

module.exports = NodeHelper.create({
  start() {
    this.timer = null;
    this.status = null;
    this.host = this.config.host;
    this.interval = this.config.interval || 3000;
    this.container = this.config.container;
    this.onlineIcon = this.config.onlineIcon || 'fa-circle';
    this.offlineIcon = this.config.offlineIcon || 'fa-circle-o';
    this.logger = Logger(this.name);
  },

  socketNotificationReceived(notification, payload) {
    if (notification === 'START_CHECK') {
      if (payload.host) {
        this.host = payload.host;
      }
      if (payload.interval) {
        this.interval = payload.interval;
      }
      if (payload.container) {
        this.container = payload.container;
      }
      this.startCheck();
    }
  },

  startCheck() {
    this.stopCheck();
    this.checkStatus();
    this.timer = setInterval(() => {
      this.checkStatus();
    }, this.interval);
  },

  stopCheck() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  checkStatus() {
    ping.sys.probe(this.host, (isAlive) => {
      if (isAlive) {
        this.checkDockerStatus();
      } else {
        this.status = 'Offline';
        this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
        this.logger.info(`Host ${this.host} is offline.`);
      }
    });
  },

  checkDockerStatus() {
    const ssh = new SSH({
      host: this.host,
      user: this.config.user,
      pass: this.config.password,
    });

    ssh
      .exec(`sudo docker ps --format "{{.Names}} {{.Status}}" | grep "${this.container}"`)
      .on('error', (err) => {
        this.logger.error(`Error: ${err}`);
        this.status = 'Error';
        this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
      })
      .on('data', (data) => {
        if (data.trim() !== '') {
          this.status = 'Online';
          this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.onlineIcon });
          this.logger.info(`Container ${this.container} on host ${this.host} is online.`);
        } else {
          this.status = 'Offline';
          this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
          this.logger.info(`Container ${this.container} on host ${this.host} is offline.`);
        }
      })
      .on('end', () => {
        ssh.end();
      });
  },
});


 
