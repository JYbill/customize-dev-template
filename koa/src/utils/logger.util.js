/**
 * @Description: 原文件src/modules/log/customLogger.js
 * @Date: 2024/6/26 18:18
 */
function CustomLogger(filePath = "") {
  this.filePath = filePath; // js源码路径
  this.info = (content) => {
    console.log(";;; " + filePath + " ;;; " + content);
  };
}
module.exports = CustomLogger;
