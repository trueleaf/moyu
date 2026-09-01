import { test, expect } from '../../../../fixtures/electron.fixture';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

test('无 preload 的 Web 模式通过代理发送官方预设，兼容流式和错误响应', async ({ electronApp }) => {
  test.setTimeout(60000);
  const requests: Array<{ url: string; headers: Record<string, string>; body: string; enableStream: boolean }> = [];
  const root = path.resolve(process.env.APIFLOW_WEB_TEST_DIST || 'dist/renderer');
  const server = createServer(async (req, res) => {
    if (req.url === '/api/proxy/http') {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const request = JSON.parse(Buffer.concat(chunks).toString()) as { url: string; headers: Record<string, string>; body: string; enableStream: boolean };
      requests.push(request);
      if (request.headers.Authorization === 'Bearer invalid-test-key') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(request.enableStream
          ? { error: { code: 'invalid_api_key', message: 'invalid-test-key' } }
          : { success: true, data: { statusCode: 401, body: Buffer.from('invalid-test-key').toString('base64') } }));
      } else if (request.enableStream) {
        res.writeHead(200, { 'Content-Type': 'text/event-stream' });
        res.end('data: ' + JSON.stringify({ choices: [{ delta: { content: 'Web 流式请求成功' } }] }) + '\n\n');
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        const response = { choices: [{ message: { content: 'Web 普通请求成功' } }] };
        res.end(JSON.stringify({ success: true, data: { statusCode: 200, body: Buffer.from(JSON.stringify(response)).toString('base64') } }));
      }
      return;
    }
    // 仅提供当前构建目录内的静态文件
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    const filePath = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : decodeURIComponent(pathname)));
    if (!filePath.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    try {
      const mime: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
      res.writeHead(200, { 'Content-Type': mime[path.extname(filePath)] || 'application/octet-stream' });
      res.end(await readFile(filePath));
    } catch { res.writeHead(404); res.end(); }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('模拟服务地址异常');
  const windowPromise = electronApp.waitForEvent('window');
  // 创建没有 Electron 桥接的 Chromium 页面，运行实际浏览器请求分支
  await electronApp.evaluate(({ BrowserWindow }) => {
    const window = new BrowserWindow({ show: false, width: 1440, height: 960, webPreferences: { sandbox: true, contextIsolation: true } });
    window.webContents.setUserAgent('Mozilla/5.0 Chrome/130.0.0.0 Safari/537.36');
    void window.loadURL('about:blank');
  });
  const page = await windowPromise;
  try {
    await page.addInitScript(() => {
      localStorage.setItem('runtime/networkMode', 'offline');
      localStorage.setItem('runtime/language', 'zh-cn');
      localStorage.setItem('runtime/hasCreatedExampleProject', 'true');
    });
    await page.goto('http://127.0.0.1:' + address.port);
    expect(await page.evaluate(() => 'electronAPI' in window)).toBe(false);
    await page.getByTestId('header-settings-btn').click();
    await page.getByTestId('settings-menu-ai-settings').click();
    const settings = page.locator('.ai-settings-container');
    await settings.getByPlaceholder('请输入 API Key').fill('deepseek-web-key');
    await settings.getByTestId('llm-test-send').click();
    await expect(settings.locator('.response-content')).toContainText('Web 普通请求成功');
    expect(requests[0]).toMatchObject({ url: 'https://api.deepseek.com/chat/completions', headers: { Authorization: 'Bearer deepseek-web-key' }, enableStream: false });
    expect(JSON.parse(requests[0].body)).toMatchObject({ model: 'deepseek-v4-flash', stream: false });
    await settings.getByTestId('llm-vendor-select').click();
    await page.getByRole('option', { name: '通义千问（阿里云百炼）', exact: true }).click();
    await settings.getByPlaceholder('请输入 API Key').fill('qwen-web-key');
    await settings.getByTestId('llm-test-stream').click();
    await expect(settings.locator('.response-content')).toContainText('Web 流式请求成功');
    expect(requests[1]).toMatchObject({ url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', headers: { Authorization: 'Bearer qwen-web-key' }, enableStream: true });
    expect(JSON.parse(requests[1].body)).toMatchObject({ model: 'qwen3.7-plus', stream: true });
    await settings.getByPlaceholder('请输入 API Key').fill('invalid-test-key');
    await settings.getByTestId('llm-test-send').click();
    await expect(settings.locator('.response-content')).toContainText('API Key 无效或已失效');
    await expect(settings.locator('.response-content')).not.toContainText('invalid-test-key');
    await settings.getByTestId('llm-test-stream').click();
    await expect(settings.locator('.response-content')).toContainText('API Key 无效或已失效');
    await expect(settings.locator('.response-content')).not.toContainText('invalid-test-key');
    expect(await page.evaluate(() => localStorage.getItem('apiflow/ai/llmProvider'))).toBeNull();
  } finally {
    await page.close();
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
