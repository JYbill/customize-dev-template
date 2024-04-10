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

/**
 * OversizeFileDownloader
 * 超大文件下载器，通过分片流断续下载大文件
 */
import streamSaver from 'streamsaver';
type OversizeFileDownloadOption = {
  url: string,
  processHandler?: () => void,
  limitSize?: number,
  downloadFilename?: string
}
type DownloadInfo = {
  res: Response,
  reader: ReadableStreamDefaultReader,
  size: number,
  fileTotalSize: number,
}

export class OversizeFileDownloader {
  url;
  limitSize;
  processHandler; // 进度钩子

  // 下面数据结束后需要重置
  isDownload = false; // 是否正在下载
  fileTotalSize = 0; // 总二进制大小（字节）
  filename = ''; // 文件名
  bufferPos = 0; // 已下载字节大小
  processLastTime = 0; // 进度钩子最后一次执行的时间
  downloadFilename;

  constructor(options: OversizeFileDownloadOption) {
    const { url, processHandler, limitSize = 1024 * 1024 * 1024, downloadFilename } = options;
    if (!url) {
      throw TypeError('url is must');
    }
    this.url = url;
    this.limitSize = limitSize; // 默认1G
    this.downloadFilename = downloadFilename || Date.now().toString();
    if (!processHandler) {
      this.processHandler = function(this: OversizeFileDownloader) {
        console.log('progress', (this.bufferPos / this.fileTotalSize * 100).toFixed(2) + '%');
      };
    } else {
      this.processHandler = processHandler;
    }
  }

  /**
   * 静态资源下载启动器
   */
  async downloadAssetsStater() {
    if (this.isDownload) {
      console.warn('downloader is running, pls wait \'isDownload = false\'');
      return;
    }
    this.isDownload = true;

    this.fileTotalSize = await this.getAssetsSize(); // 静态资源总大小
    const res = await this.downloadAssetFile();
    await this.pipeToFile(res.reader, this.downloadAssetFile);
  }

  /**
   * 重置状态
   */
  resetState() {
    this.isDownload = false;
    this.fileTotalSize = 0;
    this.bufferPos = 0;
    this.processLastTime = 0;
    this.downloadFilename = '';
  }

  /**
   * 以静态资源环境下下载
   */
  async getAssetsSize() {
    const fileInfoRes = await fetch(this.url, {
      method: 'HEAD',
    });
    const headers = fileInfoRes.headers;
    const fileSize = headers.get('Content-Length');
    return Number(fileSize);
  }
  async downloadAssetFile(startPos = 0) {
    const endPos = this.limitSize + startPos;
    const res = await fetch(this.url, {
      method: 'GET',
      headers: {
        'Range': `bytes=${startPos}-${endPos}`,
      },
    });
    const headers = res.headers;
    const size = Number(headers.get('Content-Length'));
    const reader = res.body!.getReader();
    const result: Omit<DownloadInfo, 'fileTotalSize'> = {
      res,
      reader,
      size,
    };
    return result;
  }

  /**
   * 测试函数
   */
  async debugFetch() {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: {
        'Range': `bytes=${19911656918}-`,
      },
    });
    console.log(res);
  }

  /**
   * readableStream 写入 writeableStream核心处理，采用背压机制
   * @param reader readable Reader
   * @param downloadFunc 下载函数
   * @private
   */
  private async pipeToFile(reader: ReadableStreamDefaultReader<Uint8Array>, downloadFunc: (startPos: number) => Promise<Pick<DownloadInfo, "reader">>) {
    const fileStream = streamSaver.createWriteStream(this.downloadFilename, {
      size: this.fileTotalSize,
    });
    const writer = fileStream.getWriter();

    // 分片循环下载
    while (this.bufferPos < this.fileTotalSize) {
      let done = false; // 本次HTTP range是否写入完毕

      // 循环读取二进制并写入writeable stream
      while (!done) {
        const bufferRes = await reader!.read();
        const buffer = bufferRes.value;
        done = bufferRes.done;
        if (!done) {
          await writer.ready.then(async () => {
            await writer.write(buffer);
            this.bufferPos += buffer!.length;

            // 500ms间隔执行一次钩子（简单防抖）
            if (performance.now() - this.processLastTime >= 500) {
              this.processHandler!.call(this);
              this.processLastTime = performance.now();
            }
          });
        }
      }

      if (this.bufferPos < this.fileTotalSize) {
        // 获取下一个range范围的二进制流
        const retryRes = await downloadFunc.call(this, this.bufferPos);
        reader = retryRes.reader;
      }
    }
    await writer.ready.then(() => {
      writer.close();
    });
    await writer.closed.then(() => {
      this.processHandler!.call(this);
      console.log('✅ 下载完毕');
      this.resetState();
    });
  }
}
