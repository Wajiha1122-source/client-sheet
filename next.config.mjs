import fs from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const originalReadlink = fs.readlink;
const originalReadlinkSync = fs.readlinkSync;
const originalPromisesReadlink = fs.promises.readlink;

function normalizeReadlinkError(error) {
  if (error?.code === "EISDIR" && error?.syscall === "readlink") {
    error.code = "EINVAL";
  }
  return error;
}

fs.readlink = function patchedReadlink(path, options, callback) {
  if (typeof options === "function") {
    return originalReadlink.call(fs, path, (error, linkString) => {
      options(error ? normalizeReadlinkError(error) : null, linkString);
    });
  }

  return originalReadlink.call(fs, path, options, (error, linkString) => {
    callback(error ? normalizeReadlinkError(error) : null, linkString);
  });
};

fs.readlinkSync = function patchedReadlinkSync(path, options) {
  try {
    return originalReadlinkSync.call(fs, path, options);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

fs.promises.readlink = async function patchedPromisesReadlink(path, options) {
  try {
    return await originalPromisesReadlink.call(fs.promises, path, options);
  } catch (error) {
    throw normalizeReadlinkError(error);
  }
};

for (const moduleName of ["graceful-fs", "next/dist/compiled/graceful-fs"]) {
  try {
    const gracefulFs = require(moduleName);
    const gracefulReadlink = gracefulFs.readlink;
    const gracefulReadlinkSync = gracefulFs.readlinkSync;

    gracefulFs.readlink = function patchedGracefulReadlink(path, options, callback) {
      if (typeof options === "function") {
        return gracefulReadlink.call(gracefulFs, path, (error, linkString) => {
          options(error ? normalizeReadlinkError(error) : null, linkString);
        });
      }

      return gracefulReadlink.call(gracefulFs, path, options, (error, linkString) => {
        callback(error ? normalizeReadlinkError(error) : null, linkString);
      });
    };

    gracefulFs.readlinkSync = function patchedGracefulReadlinkSync(path, options) {
      try {
        return gracefulReadlinkSync.call(gracefulFs, path, options);
      } catch (error) {
        throw normalizeReadlinkError(error);
      }
    };
  } catch {}
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: "build",
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  }
};

export default nextConfig;
