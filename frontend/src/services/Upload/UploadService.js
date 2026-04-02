import api from "../../configs/axiosConfig";

export const getVideoPresignedUrlService = ({ fileName, fileType }) => {
  return api.get("/api/upload/video-presigned-url", {
    params: { fileName, fileType },
  });
};

export const uploadFileToPresignedUrl = ({
  uploadUrl,
  file,
  fileType,
  onProgress,
}) => {
  let xhr = null;

  const promise = new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const startedAt = Date.now();
    let hasFinished = false;

    const safeResolve = (value) => {
      if (hasFinished) return;
      hasFinished = true;
      resolve(value);
    };

    const safeReject = (error) => {
      if (hasFinished) return;
      hasFinished = true;
      reject(error);
    };

    xhr = request;
    request.open("PUT", uploadUrl, true);
    request.setRequestHeader("Content-Type", fileType);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;

      const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001);
      const speedBytesPerSecond = event.loaded / elapsedSeconds;
      const remainingBytes = Math.max(event.total - event.loaded, 0);
      const remainingSeconds =
        speedBytesPerSecond > 0
          ? remainingBytes / speedBytesPerSecond
          : Number.POSITIVE_INFINITY;
      const percent = Math.round((event.loaded / event.total) * 100);

      if (typeof onProgress === "function") {
        onProgress({
          percent,
          loaded: event.loaded,
          total: event.total,
          speedMBps: speedBytesPerSecond / (1024 * 1024),
          remainingSeconds,
        });
      }
    };

    request.onload = () => {
      if (request.status >= 200 && request.status < 300) {
        if (typeof onProgress === "function") {
          onProgress({
            percent: 100,
            loaded: file.size,
            total: file.size,
            speedMBps: 0,
            remainingSeconds: 0,
          });
        }
        safeResolve(true);
        return;
      }
      safeReject(new Error("Upload video to S3 failed"));
    };

    request.onerror = () => safeReject(new Error("Upload video to S3 failed"));
    request.onabort = () => safeReject(new Error("Upload video aborted"));

    request.send(file);
  });

  const cancel = () => {
    if (xhr) {
      xhr.abort();
    }
  };

  return { promise, cancel };
};
