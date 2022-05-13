/**
 * http: network异步方法
 * 目的: 便于统一维护
 * 参数: 接受Object, 包含name:云函数名(must), data请求参数(not must)
 */
function http ({name, data=null}) {
	return new Promise((resolve, reject) => {
		// console.log('http =>', name, data);
		uniCloud.callFunction({
			name,
			data
		})
		.then(({result: res}) => {
			res.code == 200 ? resolve(res) : reject(res)
		})
		.catch(err => resolve(err));
	})
}

export default http