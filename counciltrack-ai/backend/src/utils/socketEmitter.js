let ioInstance = null;

function setSocketIO(io) {
  ioInstance = io;
}

function emitSocketEvent(eventName, payload) {
  if (ioInstance) {
    ioInstance.emit(eventName, payload);
  }
}

module.exports = {
  setSocketIO,
  emitSocketEvent,
};
