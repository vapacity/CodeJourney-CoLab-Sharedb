var backend = require("./sharedb_singleton").sharedb;
const config = require('config');

// 定义每个文档的最大空闲时间（以毫秒为单位）
const MAX_IDLE_TIME = config.get('timer.max_idle_time');

// 存储每个文档对象及其最后活动时间
let docActivityMap = new Map();

// 创建并初始化文档，添加op回调更新活动时间
function createDoc(doc) {
	// *必须要订阅文档才能接收到op事件
	doc.subscribe();
	// 将文档对象放入活动字典并记录当前时间
	docActivityMap.set(doc, Date.now());
	// 为该文档添加 op 事件回调
	doc.on("op", function (op, source) {
		// 每当文档有操作，更新活动时间
		docActivityMap.set(doc, Date.now());
	});
}

// 定时检查并关闭空闲文档
function checkForIdleDocuments() {
	const currentTime = Date.now();
	console.log("Running documents: ", docActivityMap.size);

	// 遍历所有已存储的文档及其活动时间
	docActivityMap.forEach((lastActivity, doc) => {
		if (currentTime - lastActivity > MAX_IDLE_TIME) {
			// 超过最大空闲时间，关闭文档
			console.log(`Document with ID ${doc.id} has been idle for too long, closing...`);
			doc.unsubscribe();
			// *持久化文档
			persisitDocument(doc);
			// 释放文档资源
			doc.del(function (err) {
				// *删除活动记录
				docActivityMap.delete(doc);
				if (err) {
					console.error('Error closing document:', err);
				} else {
					console.log(`Document with ID ${doc.id} closed and deleted successfully.`);
				}
			});
		}
	});
}

// 调用远程接口保存文档
function persisitDocument(doc) {
	var docCode = doc.id;
	var content = doc.data.content;
	//TODO 调用远程接口
}

// 导出方法
module.exports = {
	createDoc: createDoc,
	checkForIdleDocuments: checkForIdleDocuments,
}
