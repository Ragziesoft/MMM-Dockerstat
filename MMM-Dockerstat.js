Module.register("MMM-Dockerstat", {

  // Default module config
  defaults: {
    host: "192.168.1.2", // IP address of the second Pi machine
    interval: 5000 // Check interval in milliseconds
  },

  // Define required scripts.
  getScripts: function() {
    return ["fontawesome.js"];
  },

  // Define required styles.
  getStyles: function() {
    return ["MMM-Dockerstat.css"];
  },

  // Define start sequence.
  start: function() {
    this.status = null;
    this.sendSocketNotification("START_CHECK", this.config);
  },

  // Handle socket notifications.
  socketNotificationReceived: function(notification, payload) {
    if (notification === "STATUS_UPDATE") {
      this.status = payload;
      this.updateDom();
    }
  },

  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div");
    var icon = document.createElement("span");
    icon.className = "fas fa-3x";
    if (this.status === "Online") {
      icon.classList.add("fa-check-circle");
      icon.style.color = "green";
    } else if (this.status === "Offline") {
      icon.classList.add("fa-times-circle");
      icon.style.color = "red";
    } else {
      icon.classList.add("fa-sync");
      icon.classList.add("fa-spin");
    }
    wrapper.appendChild(icon);
    return wrapper;
  }

});
