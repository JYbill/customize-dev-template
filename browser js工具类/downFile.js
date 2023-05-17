function downVideo(url, name) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.responseType = "arraybuffer"; // 返回类型blob
  xhr.onload = function () {
    if (xhr.readyState === 4 && xhr.status === 200) {
      let blob = this.response;
      // 转换一个blob链接
      let u = window.URL.createObjectURL(new Blob([blob], { type: "video/mp4" })); // 视频的type是video/mp4，图片是image/jpeg
      let a = document.createElement("a");
      a.download = name; // 设置的文件名
      a.href = u;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };
  xhr.send();
}
