// ! just for testing, not used in the project
const ReconnectingWebSocket = require('reconnecting-websocket');
const ShareDB = require('sharedb/lib/client');

// 创建 WebSocket 连接
const socket = new ReconnectingWebSocket('ws://' + window.location.host, [], {
	maxEnqueuedMessages: 0
});
const connection = new ShareDB.Connection(socket);

// 创建本地文档实例，映射到 'shared-doc' 集合，文档 ID 为 docCode
const docCode = 'counter'; // 这里假设你的文档 ID 是 'counter'
const doc = connection.get('shared-doc', docCode);

// 获取文档的初始值并订阅更改
doc.subscribe(showContent);
doc.on('op', showContent);

function showContent() {
	const editor = document.querySelector('#editor');
	if (doc.data && doc.data.content !== editor.value) {
		editor.value = doc.data.content || 'No content';
	}
}

function updateContent() {
	const editor = document.querySelector('#editor');
	const newContent = editor.value;
	console.log('Updating content:', newContent);
	doc.submitOp([{ p: ['content'], oi: newContent }]);
}

// 曝露到全局，允许 HTML 中访问
global.updateContent = updateContent;