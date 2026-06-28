const fs = require("fs");

function normalize(error) {
  if (error && error.code === "EISDIR" && error.syscall === "readlink") {
    error.code = "EINVAL";
  }
  return error;
}

const originalReadlink = fs.readlink;
const originalReadlinkSync = fs.readlinkSync;
const originalPromisesReadlink = fs.promises && fs.promises.readlink;

fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === "function") {
    return originalReadlink.call(fs, path, (error, linkString) => {
      options(error ? normalize(error) : null, linkString);
    });
  }
  return originalReadlink.call(fs, path, options, (error, linkString) => {
    callback(error ? normalize(error) : null, linkString);
  });
};

fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return originalReadlinkSync.call(fs, path, options);
  } catch (error) {
    throw normalize(error);
  }
};

if (originalPromisesReadlink) {
  fs.promises.readlink = async function patchedPromisesReadlink(path, options) {
    try {
      return await originalPromisesReadlink.call(fs.promises, path, options);
    } catch (error) {
      throw normalize(error);
    }
  };
}
