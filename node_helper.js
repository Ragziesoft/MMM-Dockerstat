const ping = require('ping');
const SSH = require('simple-ssh');
const NodeHelper = require('node_helper');

module.exports = NodeHelper.create({
  start() {
    this.timer = null;
    this.status = null;
    this.container = payload.container;
    this.onlineIcon = 'fa-circle';
    this.offlineIcon = 'fa-circle-o';
  },

  socketNotificationReceived(notification, payload) {
      this.startCheck(payload);
  },

  startCheck(payload) {
    this.stopCheck();
    this.checkStatus();
    this.timer = setInterval(() => {
      this.checkStatus();
    }, payload.interval);
  },

  stopCheck() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  checkStatus(payload) {
    console.log('checkStatus called with host:', payload.host);
    ping.sys.probe(payload.host, (isAlive) => {
      if (isAlive) {
        this.checkDockerStatus(payload);
      } else {
        this.status = 'Offline';
        this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
        console.log(`Host ${payload.host} is offline.`);
      }
    });
  },

  checkDockerStatus(payload) {
    const ssh = new SSH({
      host: payload.host,
      user: payload.user,
      pass: payload.password,
    });

    ssh
      .exec(`sudo docker ps -f name=${this.container} --format "{{.Names}} {{.Status}}"`)
      .on('error', (err) => {
        console.error(`Error: ${err}`);
        this.status = 'Error';
        this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
      })
      .on('data', (data) => {
        if (data.trim() !== '') {
          this.status = 'Online';
          this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.onlineIcon });
          console.info(`Container ${this.container} on host ${payload.host} is online.`);
        } else {
          this.status = 'Offline';
          this.sendSocketNotification('STATUS_UPDATE', { status: this.status, icon: this.offlineIcon });
          console.info(`Container ${this.container} on host ${payload.host} is offline.`);
        }
      })
      .on('end', () => {
        ssh.end();
      });
  },
});
