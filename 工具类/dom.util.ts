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
