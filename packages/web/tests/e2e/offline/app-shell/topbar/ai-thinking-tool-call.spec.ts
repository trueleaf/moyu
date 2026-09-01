import { test, expect } from '../../../../fixtures/electron.fixture';
import { createServer } from 'node:http';
import type { LLMessage } from '../../../../../src/types/ai/agent.type';

test('Agent 多轮工具调用保留完整思考内容并在后续用户轮次恢复', async ({ topBarPage, contentPage, clearCache }) => {
  test.setTimeout(60000);
  const requests: Array<{ stream?: boolean; messages: LLMessage[] }> = [];
  const server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const body = JSON.parse(Buffer.concat(chunks).toString()) as { stream?: boolean; messages: LLMessage[] };
    requests.push(body);
    if (!body.stream) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ choices: [{ message: { content: '{"tools":["getProjectList"]}' } }] }));
      return;
    }
    const hasToolResult = body.messages.some(message => message.role === 'tool');
    res.writeHead(200, { 'Content-Type': 'text/event-stream' });
    if (!hasToolResult) {
      // 模拟跨分片的推理和工具调用，最后一片不包含换行
      res.write('data: ' + JSON.stringify({ choices: [{ delta: { reasoning_content: '先读取' } }] }) + '\n\n');
      res.write('data: ' + JSON.stringify({ choices: [{ delta: { reasoning_content: '项目列表' } }] }) + '\n\n');
      res.end('data: ' + JSON.stringify({ choices: [{ delta: { tool_calls: [{ index: 0, id: 'call-e2e', type: 'function', function: { name: 'getProjectList', arguments: '{}' } }] }, finish_reason: 'tool_calls' }] }));
    } else {
      res.write('data: ' + JSON.stringify({ choices: [{ delta: { reasoning_content: '根据工具结果作答' } }] }) + '\n\n');
      res.end('data: ' + JSON.stringify({ choices: [{ delta: { content: '已读取当前项目列表，多轮工具调用验证成功。' }, finish_reason: 'stop' }] }));
    }
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('模拟服务地址异常');
  try {
    await clearCache();
    await topBarPage.getByTestId('header-ai-btn').click();
    const dialog = contentPage.locator('.ai-dialog');
    await dialog.getByRole('button', { name: '设置', exact: true }).click();
    await dialog.getByTestId('llm-vendor-select').click();
    await contentPage.getByRole('option', { name: '自定义（OpenAI Compatible）', exact: true }).click();
    await dialog.getByPlaceholder('请输入 API Base URL').fill('http://127.0.0.1:' + address.port + '/chat/completions');
    await dialog.getByPlaceholder('请输入模型 ID').fill('thinking-model');
    await dialog.getByTestId('llm-save').click();
    await dialog.getByRole('button', { name: '返回', exact: true }).click();
    await dialog.locator('.ai-input').fill('请列出项目列表');
    await dialog.locator('.ai-send-btn').click();
    await expect(dialog.locator('.ai-bubble-response')).toContainText('多轮工具调用验证成功');
    const continuation = requests.find(request => request.messages.some(message => message.role === 'tool'));
    expect(continuation?.messages.find(message => message.tool_calls?.length)).toMatchObject({ reasoning_content: '先读取项目列表' });
    // 新的用户轮次需携带上次最终回答对应的思考字段
    await dialog.locator('.ai-input').fill('请再次列出项目列表');
    await dialog.locator('.ai-send-btn').click();
    await expect(dialog.locator('.ai-bubble-response')).toHaveCount(2);
    const latest = requests.filter(request => request.stream).at(-1);
    expect(latest?.messages.some(message => message.role === 'assistant' && message.reasoning_content === '根据工具结果作答')).toBe(true);
  } finally {
    server.closeAllConnections();
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});
