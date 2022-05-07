/**
 * 通过webpack的自动化工程api自动导出
 */
const requireApi = require.context('./', false, /.js$/); // webpack自动化

const api = {}; // 所有api接口自动化装箱集合

// 自动化迭代处理
requireApi.keys().forEach(item => {
	
	// 过滤index.js
	if (item === './index.js') return
	 
	Object.assign(api, requireApi(item).default); // 对象合并
})

export default api;