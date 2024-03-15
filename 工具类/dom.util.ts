/**
 * 拖拽移动el元素(该元素必须具备position: absolute才能正常生效)
 * @param el html元素
 */
export function dragEl(el: HTMLElement) {
  let disX = 0,
    disY = 0;
  let { clientWidth, clientHeight } = el;
  let { innerWidth, innerHeight } = window;
  el.onmousedown = function (e): any {
    e = e || window.event;
    disX = e.clientX - el.offsetLeft;
    disY = e.clientY - el.offsetTop;
    document.onmousemove = function (e) {
      e = e || window.event;
      let x = e.clientX - disX;
      let y = e.clientY - disY;
      if (x < 0) x = 0;
      else if (x > innerWidth - clientWidth) x = innerWidth - clientWidth;
      if (y < 0) y = 0;
      else if (y > innerHeight - clientHeight) y = innerHeight - clientHeight;
      el.style.left = x + "px";
      el.style.top = y + "px";
    };
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
    };
    return false;
  };
}

/**
 * 等待el元素下的所有img元素加载完毕
 * @param el
 */
export async function waitAllImagesLoaded(el: HTMLElement) {
  return new Promise((resolve, reject) => {
    const images = el.querySelectorAll("img");
    if (images.length <= 0) {
      resolve(true);
    }
    // 剔除已完成的img
    const loadingImgList: HTMLElement[] = []; // 需要加载的img List
    let total = Array.from(images).reduce((pre, curr) => {
      if (curr.complete) {
        return pre;
      }
      loadingImgList.push(curr);
      return pre + 1;
    }, 0);
    // 待加载图片的总数，为0返回resolve表示所有图片都加载完毕
    if (total <= 0) {
      return resolve(true);
    }
    // 实际需要等待下载的img元素
    for (const img of loadingImgList) {
      img.onload = () => {
        total--;
        if (total <= 0) {
          setTimeout(() => resolve(true), 400);
        }
      };
    }
  });
}
