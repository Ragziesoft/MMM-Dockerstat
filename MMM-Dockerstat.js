Module.register("MMM-Dockerstat", {

  // Default module config
  defaults: {
    host: "192.168.1.200", // IP address of the second Pi machine
    interval: 5000 // Check interval in milliseconds
  },

  // Define required styles.
  getStyles: function () {
    return ["MMM-Dockerstat.css", "font-awesome.css"];
  },

  // Define start sequence.
  start: function () {
    this.sendSocketNotification("START_CHECK", this.config);
  },

  // Handle socket notifications.
  socketNotificationReceived: function (notification, payload) {
    if (notification === "STATUS_UPDATE") {
      this.status = payload;
      this.draw(this.status);
    }
  },

  draw: function (status) {
    var statusInfo = status;
    wrapper = this.wrapper
    var icon = document.createElement("span");
    icon.className = "fas fa-3x";
    if (statusInfo.status === "Online") {
      icon.classList.add("fa-check-circle");
      icon.style.color = "green";
    } else if (statusInfo.status === "Offline") {
      icon.classList.add("fa-times-circle");
      icon.style.color = "red";
    } else {
      icon.classList.add("fa-sync");
      icon.classList.add("fa-spin");
    }
    wrapper.appendChild(icon);
    Log.log("New wrapper", wrapper)
    return wrapper();
  },

  // Override dom generator.
  getDom: function () {
    var wrapper = document.createElement("div");
    this.wrapper = wrapper;
    return this.wrapper;
  }

});
