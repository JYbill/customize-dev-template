const BASE_URL: string = "http://httpbin.org";

interface httArgs {
  url: string,
  data?: object,
  method?: string | any,
  header?: object | undefined,
  dataType?: string | any,
  responseType?: string | any
}

function http({
  url, 
  data,
  header, 
  method = 'GET', 
  dataType = 'json', 
  responseType = 'text'}: httArgs
  ) {
  return new Promise((resolve, reject): void => {
    wx.request({
      url: `${BASE_URL}/${url}`,
      data,
      method,
      header,
      dataType,
      responseType,
      success(res): void {
        // console.log('success =>', res);
        resolve(res);
      },
      fail(e): void {
        console.log('fail =>', e);
        reject(e);
      }
    });
  })
  .catch(e => {
    console.log('reject =>', e);
    return Promise.resolve(e);
  });
}

export  {
  http
}