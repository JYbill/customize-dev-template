/**
 * @Description: multer uploader 工具
 * @Date: 2024/6/25 18:11
 */
const crypto = require("crypto");
const extname = require("path").extname;

const appConfig = require("app/base").config;
const ossConfig = appConfig.get("oss");
const { callbackUrlPath } = appConfig.get("upload");
const { baseUrl } = appConfig.get("application");
const localUploadHost = `${baseUrl}${ossConfig.localUploadHost}`;

const allowTypes = [
  "multipart/form-data",
  "text/json",
  "application/octet-stream",
  "image/png",
  "image/jpeg",
  "image/gif", //.png, .jpg, .gif
  "text/rtf", // .rtf
  "application/pdf",
  "application/vnd.ms-excel", //.xls
  "application/msword", //.doc
  "application/vnd.ms-powerpoint", // .pps, .ppt
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "video/mp4",
  "audio/mp3",
  "audio/mpeg3",
  "audio/x-mpeg",
  "audio/mpeg",
  "application/kswps",
  "application/kset",
  "application/ksdps",
  "application/zip",
  "application/x-zip-compressed", // .zip
  "application/x-rar",
  "application/x-rar-compressed", // .rar
  "application/x-tar",
  "application/x-gzip",
  "application/x-7z-compressed", //.7z
];

const allowFileExts = [
  "json",
  "png",
  "jpg",
  "jpe",
  "jpeg",
  "blob",
  "gif",
  "rtf",
  "pdf",
  "xls",
  "xlsx",
  "xlm",
  "xla",
  "xlc",
  "xlt",
  "xlw",
  "doc",
  "docx",
  "dot",
  "ppt",
  "pptx",
  "pps",
  "ppa",
  "pot",
  "mp4",
  "m4a",
  "mp4a",
  "mp4v",
  "mpg4",
  "mp3",
  "mpeg3",
  "mpeg",
  "wps",
  "et",
  "dps",
  "zip",
  "rar",
  "7z",
  "tar",
];

const checkFileExt = (fileName) => {
  const ext = extname(`x.${fileName}`).toLowerCase().substr(1);
  return allowFileExts.indexOf(ext) > -1;
};

const getCallbackParam = () => {
  const callbackUrl = `${baseUrl}/${callbackUrlPath}`;
  const callbackBody = '{"bucket":${bucket},"object":${object},"etag":${etag},"size":${size},"mimeType":${mimeType}}';
  const callbackBodyType = "application/json";
  const callbackString = JSON.stringify({ callbackUrl, callbackBody, callbackBodyType });
  return Buffer.from(callbackString).toString("base64");
};

const ossSignature = (maxSize = 314572800, expire = 120000, mimeType, needCallback) => {
  const end = new Date().getTime() + expire;
  const expiration = new Date(end).toISOString();
  const conditions = [["content-length-range", 0, maxSize]];
  // if (mimeType) {
  //   conditions.push(['eq', '$Content-Type', mimeType]);
  // }
  let policyString = {
    expiration,
    conditions,
  };
  policyString = JSON.stringify(policyString);
  const policy = new Buffer(policyString).toString("base64");
  const signature = crypto.createHmac("sha1", ossConfig.accessKeySecret).update(policy).digest("base64");

  const res = {
    signature,
    host: ossConfig.storage === "local" ? localUploadHost : `https://${ossConfig.bucket}.${ossConfig.outerEndpoint}`,
    policy,
    accessKeyId: ossConfig.accessKeyId,
    expireTime: end,
  };

  if (ossConfig.storage === "local") {
    res.prefix = ossConfig.localPrefixUrl;
    res.host = localUploadHost;
  } else {
    res.prefix = ossConfig.host;
  }

  if (needCallback) {
    res.callback = getCallbackParam();
  }

  return res;
};

const handleFilePath = (url) => {
  return url.replace(new RegExp(localUploadHost, "gm"), ossConfig.localPrefixUrl);
};

module.exports = {
  ossSignature,
  checkFileExt,
  handleFilePath,
};
