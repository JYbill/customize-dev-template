/**
 * @file: bom.util.ts
 * @author: xiaoqinvar
 * @desc: 浏览器相关常用方法封装
 * @dependencies:
 * @date: 2023-03-06 11:41:22
 */

/**
 * 复制文本，兼容HTTPS安全上下文环境 和 非安全上下文
 * @param { string } 被复制的文本字符串
 * @returns { Promise<void> }
 */
export async function copyTxt(text: string): Promise<void> {
  if (navigator.clipboard) {
    // HTTPS环境
    await navigator.clipboard.writeText(text);
  } else {
    var textarea = document.createElement("textarea");
    document.body.appendChild(textarea);
    // 隐藏此输入框
    textarea.style.position = "fixed";
    textarea.style.clip = "rect(0 0 0 0)";
    textarea.style.top = "10px";
    // 赋值
    textarea.value = text;
    // 选中
    textarea.select();
    // 复制
    document.execCommand("copy", true);
    // 移除输入框
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
export function waitAllImagesLoaded(el) {
  return new Promise((resolve, reject) => {
    const images = el.querySelectorAll("img");
    if (images.length <= 0) resolve(true);

    // 待加载图片的总数，为0返回resolve表示所有图片都加载完毕
    let total = images.length;
    for (const img of images) {
      // 情况一：img已经加载完毕
      if (img.complete === true) {
        total--;
        continue;
      }

      // 情况二：img未加载完毕
      img.onload = () => {
        if (--total <= 0) resolve(true);
      };
    }
    if (total <= 0) resolve(true);
  });
}
