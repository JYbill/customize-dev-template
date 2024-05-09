/**
 * @file: bom.util.ts
 * @author: xiaoqinvar
 * @desc: 浏览器相关常用方法封装
 * @dependencies:
 * @date: 2023-03-06 11:41:22
 */

/**
 * 复制文本，兼容HTTPS安全上下文环境 和 非安全上下文
 * @returns { Promise<void> }
 * @param text
 */
export async function copyTxt(text: string): Promise<void> {
    if (navigator.clipboard) {
      // HTTPS环境
      await navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      document.body.appendChild(textarea);
      textarea.style.position = "absolute";
      textarea.style.zIndex = "-1";
      textarea.style.opacity = "0";
      textarea.value = text || "";
      textarea.select();
      document.execCommand("copy", true);
      document.body.removeChild(textarea);
    }
  }

/**
 * 通过fetch获取二进制数据，并转为blob后通过a标签下载
 * @param apiUrl {string}
 * @param query post参数
 */
export async function fetchDownloadBlob(apiUrl, query) {
  const data = await fetch(apiUrl, {
    method: "POST",
    responseType: "blob",

    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.token,
    },
    body: JSON.stringify(query),
  });
  const blob = await data.blob();
  const url = window.URL.createObjectURL(
    new Blob([blob], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const link = document.createElement("a");
  link.style.display = "none";
  link.href = url;
  link.setAttribute("download", "reservationList.xlsx");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 通过xhr下载二进制文件并用a标签保存到本地
 * @param url
 * @param name 文件名
 */
export function downVideo(url, name) {
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

/**
 *
 * @param str {string}
 * @returns
 */
export async function copyToClipboard(str) {
  // HTTPS下启用
  const res = await navigator.permissions.query({ name: "clipboard-write" });
  if (res.state === "granted") {
    return await navigator.clipboard.writeText(str);
  } else {
    const el = document.createElement("textarea");
    el.value = str;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    return Promise.resolve(true);
  }
}

/**
 * 等待el元素下的所有img元素加载完毕
 * @param el
 * @return {Promise<boolean>}
 */
export async function waitAllImagesLoaded(el) {
  return new Promise((resolve, reject) => {
    const images = el.querySelectorAll("img");
    if (images.length <= 0) resolve(true);

    // 待加载图片的总数，为0返回resolve表示所有图片都加载完毕
    // 剔除已完成的img
    const loadingImgList = []; // 需要加载的img List
    let total = [...images].reduce((pre, curr) => {
      if (curr.complete) return pre;
      loadingImgList.push(curr);
      return pre + 1;
    }, 0);
    // console.log("debug 待加载图片总数", total);
    // console.log(...loadingImgList);
    if (total <= 0) return resolve(true); // 没有需要加载的img
    for (const img of loadingImgList) {
      img.onload = () => {
        total--;
        if (total <= 0) setTimeout(() => resolve(true), 300); // 期间没有网络请求可以取消setTimeout
      };
    }
  });
}

/**
 * 打印模板
 * 打印附加图片：一张图一页显示
 * @param imgList
 */
export function printPicture(imgList) {
  // 推荐：克隆节点当作模板，最后销毁节点时不影响该模板节点
  const printNode = this.$refs.picturePrintRef.$el.cloneNode(true);
  printNode.style.display = "block";

  let loadNum = 0;
  const iframeDOM = document.createElement("iframe");
  iframeDOM.style.display = "none";
  // debug
  // iframeDOM.width = "50%";
  // iframeDOM.height = "50%";
  // iframeDOM.style.position = "absolute";
  // iframeDOM.style.left = "0";
  // iframeDOM.style.top = "0";
  const iframe = document.body.appendChild(iframeDOM);
  const iframeDoc = iframe.contentDocument;
  const iframeWindow = iframe.contentWindow;

  // <div><img></div> 让img自动自适应div内容
  iframeDoc.head.innerHTML = `<style>
        img {
          width: 100%;
          object-fit: scale-down;
        }
      </style>`;
  const divEl = document.createElement("div");
  iframeDoc.body.append(divEl);

  for (const url of imgList) {
    const img = new Image();
    img.src = url;
    const divEl = document.createElement("div");
    divEl.append(img);
    divEl.style.width = "100%";
    divEl.style.height = "840px"; // 高度 = 980(A4高度) - 140(表头高度)
    divEl.style.display = "flex";
    divEl.append(img, divEl);

    img.addEventListener("load", (evt) => {
      // 不改变原始图片比例下，一张图一页
      img.style.marginBottom = `${855 - img.height}px`;
      if (++loadNum === imgList.length) {
        iframeWindow.focus();
        iframeWindow.print();
        iframeWindow.onafterprint = () => {
          document.body.removeChild(iframe);
        };
      }
    });
    img.src = url;
  }
}

/**
 * 获取localStorage已存储的总大小，返回的是localStorage字符串长度
 * 限制5M为字符串长度，内存大小为5M * utf-16大小 = 10M
 * @returns {number}
 */
export function statisticsLSTotal() {
  return Object.entries(localStorage).map(v => v.join('')).join('').length;
}