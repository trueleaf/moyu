# AI SDK 6 Agent 迁移测试 TODO

## 验收规则

1. 所有 AI 相关测试必须使用 `.env` 中配置的真实 DeepSeek API Key 和真实 DeepSeek API，不使用本地 mock server 替代真实模型调用。
2. Agent E2E 测试必须覆盖真实 DeepSeek API 的普通文本、SSE、tool calls、错误和中断场景。
3. 测试应优先模拟用户操作完成流程，禁止直接调用业务 store 方法来绕过 UI 行为。
4. Ask 模式、Agent 模式、业务工具副作用、取消执行、错误处理、多语言行为都必须覆盖。
5. 第一阶段允许移除旧 Agent 工具逻辑和旧 `rawTools` Agent 注册入口，但不得破坏非 Agent 业务能力和 MCP 必要能力。
6. 修改完成后必须执行 `npm run type-check`，并执行相关 Playwright 测试。
7. 新增文案必须使用 `t()`，并同步更新 `zh-cn.ts` 和 `en.ts`。
8. 新增代码禁止使用 `any`、`enum`、行内样式、`console.log` 调试代码。
9. 禁止修改 `share.html` 和 `testData.ts`。
10. 默认 AI 模型必须调整为 `deepseek-v4-pro`，并确保设置页、缓存初始化、Electron 主进程同步和测试 fixture 使用同一默认模型；`deepseek-v4-flash` 可作为低成本可选模型。
11. AI 助手功能必须限制为仅离线模式可用，在线模式下不得打开 AI 面板、发送 Ask、执行 Agent 或触发业务工具修改。
12. Agent 工具系统必须重构为离线优先、变更集驱动、可审批、少工具、高语义的设计。
13. 新工具系统不得复刻旧的字段级工具拆分方式，应优先使用业务级工具和统一 patch/changeSet 协议。
14. 迁移必须按阶段推进：移除旧 Agent 工具逻辑、固定运行边界、建设新工具协议、实现只读工具、实现 changeSet 草案工具、实现审批和应用、接入 AI SDK 6、补齐运行类工具、收尾验证。
15. 本次不考虑旧 Agent 工具系统兼容与回退，允许移除旧 Agent 工具逻辑和旧字段级工具注册入口。
16. 所有测试通过且 TODO 项状态更新完成后，才视为测试集验收完成。

## 执行规则

1. 每完成一个 TODO item，必须立即将状态从“未开始”改为“已完成”。
2. 如果某个 item 因外部原因暂时无法完成，将状态改为“阻塞”，并在备注中写明原因。
3. 如果某个 item 被拆分为更小任务，保留原 item，并在其下方追加子任务。
4. 执行过程中发现遗漏场景时，必须追加新的 TODO item，初始状态为“未开始”。
5. 测试代码变更应尽量集中在 `packages/web/tests/` 和必要的真实 DeepSeek API fixture 文件中。
6. 每个测试用例应具备明确断言，不能只验证“没有报错”。
7. 测试名称应表达用户场景和期望结果。
8. 不允许为了让测试通过而削弱业务断言。
9. 不允许在代码、测试、日志、截图或提交内容中输出真实 DeepSeek API Key。
10. 如果 `.env` 缺少真实 DeepSeek API Key，相关测试 item 必须标记为“阻塞”，并写明缺少的环境变量名称。
11. 真实 API 测试需要控制调用次数，避免重复执行造成不必要的额度消耗。
12. 涉及 AI 离线限制的 item 完成后，必须验证快捷键、Header 入口、发送入口和工具执行入口都已覆盖。
13. 涉及新工具系统的 item 完成后，必须同步更新工具注册、工具选择、AI SDK 适配、UI 展示和测试用例。
14. 新工具系统迁移期间不保留旧 Agent 工具回退路径，旧 Agent 工具逻辑移除后不得再作为 Agent 执行入口。
15. 每个阶段完成后必须更新阶段状态和验证结果。
16. 涉及真实 DeepSeek API 的测试必须记录调用次数和测试目的，不允许无意义重复调用。
17. 旧 Agent 工具逻辑移除后不得继续添加字段级工具；新增 Agent 能力必须进入新工具系统。

## TODO List

### 一、测试基础设施

- [ ] 状态：未开始 | 从 `.env` 读取真实 DeepSeek API Key、baseURL 和 model 配置，禁止硬编码密钥。
- [ ] 状态：未开始 | 新增真实 DeepSeek API 非流式响应测试 fixture。
- [ ] 状态：未开始 | 新增真实 DeepSeek API SSE 流式文本响应测试 fixture。
- [ ] 状态：未开始 | 新增真实 DeepSeek API SSE 流式 `tool_calls` 响应测试 fixture。
- [ ] 状态：未开始 | 新增真实 DeepSeek API 工具参数分片输出验证场景。
- [ ] 状态：未开始 | 新增真实 DeepSeek API 错误响应验证场景。
- [ ] 状态：未开始 | 新增真实 DeepSeek API 超时和中断验证场景。
- [ ] 状态：未开始 | 新增测试 fixture，用于配置 AI baseURL、apiKey、model，默认 model 必须为 `deepseek-v4-pro`。
- [ ] 状态：未开始 | 新增测试 fixture，用于在测试结束后清理 AI 配置和对话缓存。
- [ ] 状态：未开始 | 确认测试日志、错误输出和截图中不会泄露真实 DeepSeek API Key。
- [ ] 状态：未开始 | 新增真实 DeepSeek API 调用次数控制策略，避免单次测试运行产生过多请求。

### 二、静态与类型测试

- [ ] 状态：未开始 | 执行 `npm run type-check` 并确保无类型错误。
- [ ] 状态：未开始 | 检查新增代码中没有 `console.log`。
- [ ] 状态：未开始 | 检查新增代码中没有 `$t(`。
- [ ] 状态：未开始 | 检查新增代码中没有行内样式。
- [ ] 状态：未开始 | 检查新增代码中没有 `any`。
- [ ] 状态：未开始 | 检查新增代码中没有 `enum`。

### 三、LLM Provider 配置测试

- [ ] 状态：未开始 | 配置 baseURL、apiKey、model 后，Agent 请求应打到真实 DeepSeek API。
- [ ] 状态：未开始 | 配置 customHeaders 后，真实 DeepSeek API 请求应携带自定义 header。
- [ ] 状态：未开始 | 配置 extraBody 后，真实 DeepSeek API 请求应携带 extraBody 字段。
- [ ] 状态：未开始 | 未配置 API Key 时，UI 应提示 AI 不可用且不发起请求。
- [ ] 状态：未开始 | Electron 模式配置变更后，Agent 应使用最新配置。
- [ ] 状态：未开始 | 默认 LLM 配置初始化时，model 应为 `deepseek-v4-pro`。
- [ ] 状态：未开始 | 重置 LLM 配置后，model 应恢复为 `deepseek-v4-pro`。
- [ ] 状态：未开始 | 从旧缓存读取到旧默认模型时，应迁移或覆盖为 `deepseek-v4-pro`。

### 四、Ask 模式回归测试

- [ ] 状态：未开始 | 切换 Ask 模式并发送普通问题，应展示流式回答。
- [ ] 状态：未开始 | Ask 流式过程中点击停止，应停止输出并恢复完成状态。
- [ ] 状态：未开始 | Ask 请求失败时，应展示错误消息且不影响下一次发送。
- [ ] 状态：未开始 | Ask 第二轮请求应携带上一轮问答上下文。
- [ ] 状态：未开始 | 清空对话后，Ask 和 Agent 对话都应被清空。

### 四-一、AI 离线模式限制测试

- [ ] 状态：未开始 | 在线模式下，Header 触发 AI 助手入口时不应打开 AI 面板，并应给出仅离线模式可用提示。
- [ ] 状态：未开始 | 在线模式下，快捷键 `Ctrl+L` 或 `Command+L` 不应打开 AI 面板，并应给出仅离线模式可用提示。
- [ ] 状态：未开始 | 在线模式下，已打开的 AI 面板应被关闭或禁用，避免继续使用。
- [ ] 状态：未开始 | 在线模式下，Ask 模式发送入口应被阻止，不应调用真实 DeepSeek API。
- [ ] 状态：未开始 | 在线模式下，Agent 模式发送入口应被阻止，不应调用真实 DeepSeek API。
- [ ] 状态：未开始 | 在线模式下，`runAgent` 内部应有兜底 guard，禁止执行 Agent。
- [ ] 状态：未开始 | 在线模式下，`sendAskFromInput` 内部应有兜底 guard，禁止发送 Ask。
- [ ] 状态：未开始 | 在线模式下，AI 工具执行层应有兜底 guard，禁止创建、修改、删除或恢复在线业务数据。
- [ ] 状态：未开始 | 从离线模式切换到在线模式时，如 AI 正在执行，应停止当前执行并恢复完成状态。
- [ ] 状态：未开始 | 从在线模式切换回离线模式后，AI 助手应恢复可打开和可发送。
- [ ] 状态：未开始 | 离线模式下，AI 面板打开、Ask 发送、Agent 执行应保持可用。
- [x] 状态：已完成 | AI 设置页在线模式下不展示；AI 配置仅离线模式可查看和编辑。
- [ ] 状态：未开始 | 新增“仅离线模式可用”相关文案，并同步更新 `zh-cn.ts` 和 `en.ts`。

### 五、Agent 基础执行测试

- [ ] 状态：未开始 | 普通问答不需要工具时，应只展示最终回答，不展示工具卡片。
- [ ] 状态：未开始 | 单工具调用成功时，应展示工具调用、success 状态和最终回答。
- [ ] 状态：未开始 | 单工具调用失败时，应展示工具 error 状态和失败说明。
- [ ] 状态：未开始 | 多工具串行调用时，工具应按顺序展示并产生正确业务副作用。
- [ ] 状态：未开始 | 多轮工具循环时，Agent 应在工具结果后继续执行下一步。
- [ ] 状态：未开始 | 模型持续返回 tool call 达到最大步数时，Agent 应停止并展示提示。
- [ ] 状态：未开始 | 模型返回空内容且无 tool call 时，UI 不应挂起。
- [ ] 状态：未开始 | 模型返回非法 tool arguments 时，UI 应展示参数解析失败。

### 六、新工具适配器测试

- [ ] 状态：未开始 | AI SDK tool key 应与新 `AgentToolDefinition.name` 保持一致。
- [ ] 状态：未开始 | AI SDK tool description 应与新工具 description 保持一致。
- [ ] 状态：未开始 | AI SDK inputSchema 应完整映射新工具 `inputSchema`。
- [ ] 状态：未开始 | 工具执行时应注入 `_targetLanguage`。
- [ ] 状态：未开始 | 工具成功返回时，应转换为模型可读结果。
- [ ] 状态：未开始 | 工具失败返回时，应保留错误信息并展示失败状态。
- [ ] 状态：未开始 | 工具抛异常时，Agent 应捕获异常且 UI 不应卡死。
- [ ] 状态：未开始 | 工具返回大结果时，应进行摘要或截断，避免上下文过大。

### 七、业务工具 E2E 测试

- [ ] 状态：未开始 | 用户输入“创建一个用户管理项目”后，首页项目列表应新增项目。
- [ ] 状态：未开始 | 用户输入“打开用户管理项目”后，应进入 workbench 且当前项目正确。
- [ ] 状态：未开始 | 用户输入“创建登录接口”后，左侧树应新增 HTTP 节点。
- [ ] 状态：未开始 | 用户输入“把当前接口改名为用户登录”后，当前节点名称应变更。
- [ ] 状态：未开始 | 用户输入“给当前接口添加 token 请求头”后，Headers 区域应出现 Authorization。
- [ ] 状态：未开始 | 用户输入“创建用户列表 mock”后，应新增 HTTP Mock 节点。
- [ ] 状态：未开始 | 用户输入“启动当前 mock 服务”后，mock 状态应变为运行中。
- [ ] 状态：未开始 | 用户输入“创建 WebSocket 聊天连接”后，应新增 WebSocket 节点。
- [ ] 状态：未开始 | 用户输入“创建一个 token 变量”后，变量列表应新增 token。
- [ ] 状态：未开始 | 用户输入“搜索登录相关接口”后，Agent 应展示搜索结果且不修改数据。

### 八、上下文测试

- [ ] 状态：未开始 | 当前无项目时要求创建接口，Agent 应提示需要项目或先创建项目。
- [ ] 状态：未开始 | 当前已有项目时创建接口，Agent 应自动使用当前 `projectId`。
- [ ] 状态：未开始 | 当前选中 HTTP tab 时要求修改当前接口，Agent 应使用 activeTab.id。
- [ ] 状态：未开始 | 当前选中 WebSocket tab 时要求修改当前连接，Agent 不应误调用 HTTP 工具。
- [ ] 状态：未开始 | 多项目存在时要求搜索项目，Agent 应先查询再操作，不应伪造 projectId。

### 九、取消与并发测试

- [ ] 状态：未开始 | Agent 执行中点击停止，当前 loading 工具应变为取消或错误状态。
- [ ] 状态：未开始 | Agent 执行中点击停止，工作状态应恢复为完成。
- [ ] 状态：未开始 | 停止后再次发送消息，新请求应可正常执行。
- [ ] 状态：未开始 | 连续快速点击发送，不应产生并发 Agent 执行。
- [ ] 状态：未开始 | 流式中断后，UI 不应残留 loading 状态。
- [ ] 状态：未开始 | 工具执行中断后，不应继续执行后续工具。

### 十、审批能力测试

- [ ] 状态：未开始 | 调用 `requiresApproval: true` 工具时，UI 应显示确认卡片且不立即执行。
- [ ] 状态：未开始 | 用户批准工具调用后，工具应继续执行并展示 success。
- [ ] 状态：未开始 | 用户拒绝工具调用后，工具不应执行，Agent 应说明已取消。
- [ ] 状态：未开始 | 多个待审批工具应逐个展示审批状态。
- [ ] 状态：未开始 | 审批期间点击停止后，不应继续执行后续步骤。

### 十一、多语言测试

- [ ] 状态：未开始 | 中文输入时，Agent 回复和创建内容应保持中文。
- [ ] 状态：未开始 | 英文输入时，Agent 回复和创建内容应保持英文。
- [ ] 状态：未开始 | 日文输入时，Agent 回复和创建内容应保持日文。
- [ ] 状态：未开始 | 第二轮切换语言时，回复语言应跟随最新输入。
- [ ] 状态：未开始 | 新工具生成变更集和摘要时，应正确传递 `_targetLanguage`。

### 十二、第一批最小落地测试

- [ ] 状态：未开始 | Ask 模式不受 Agent 迁移影响。
- [ ] 状态：未开始 | Agent 单工具调用成功。
- [ ] 状态：未开始 | Agent 多工具串行调用成功。
- [ ] 状态：未开始 | Agent 达到最大步数后停止。
- [ ] 状态：未开始 | Agent 执行中停止。
- [ ] 状态：未开始 | Agent 创建 HTTP 接口。
- [ ] 状态：未开始 | Agent 修改当前接口。
- [ ] 状态：未开始 | Agent 中文输入保持中文。
- [ ] 状态：未开始 | customHeaders 生效。
- [ ] 状态：未开始 | `npm run type-check` 通过。
- [ ] 状态：未开始 | 在线模式下 AI 助手入口、Ask 发送和 Agent 执行全部被阻止。
- [ ] 状态：未开始 | 离线模式下 AI 助手入口、Ask 发送和 Agent 执行保持可用。

### 十三、新 Agent 工具系统设计与迁移

- [ ] 状态：未开始 | 设计新的 `AgentToolDefinition` 类型，包含 `name`、`title`、`description`、`domain`、`effect`、`scope`、`riskLevel`、`requiresApproval`、`inputSchema`、`execute`。
- [ ] 状态：未开始 | 设计新的 `AgentToolContext` 类型，包含 `projectId`、`activeNodeId`、`activeTabType`、`language`、`networkMode`、`abortSignal`。
- [ ] 状态：未开始 | 设计新的 `AgentToolResult` 类型，统一成功、失败、摘要、错误、`changeSetId` 返回格式。
- [ ] 状态：未开始 | 明确所有新工具 `scope` 固定为 `offline`，在线模式调用必须返回拒绝结果。
- [ ] 状态：未开始 | 建立新工具注册目录，避免继续在旧 `tools.ts` 中无限追加字段级工具。
- [ ] 状态：未开始 | 移除旧 Agent 工具注册入口，确保 Agent 不再加载旧字段级工具。
- [ ] 状态：未开始 | 统计旧工具使用场景，将仍需保留的业务能力映射到新高语义工具。

### 十四、变更集协议设计

- [ ] 状态：未开始 | 设计 `ChangeSet` 类型，包含 `id`、`projectId`、`title`、`description`、`operations`、`status`、`createdAt`。
- [ ] 状态：未开始 | 设计 `ChangeOperation` 类型，支持 `createNode`、`updateNode`、`moveNode`、`deleteNode`、`restoreNode`、`updateVariables`、`updateCommonHeaders`。
- [ ] 状态：未开始 | 设计节点创建 operation schema，覆盖 folder、http、websocket、httpMock、websocketMock。
- [ ] 状态：未开始 | 设计节点更新 patch schema，支持名称、描述、HTTP 配置、WebSocket 配置、Mock 配置。
- [ ] 状态：未开始 | 设计变更集校验规则，校验 projectId、nodeId、parentId、节点类型、URL、方法、参数结构。
- [ ] 状态：未开始 | 设计变更集 diff 结构，用于 UI 展示将新增、修改、删除、移动哪些内容。
- [ ] 状态：未开始 | 设计变更集状态流转：`draft`、`previewed`、`approved`、`applied`、`discarded`、`failed`。
- [ ] 状态：未开始 | 设计变更集存储策略，明确是否只保存在内存，还是落到 IndexedDB。
- [ ] 状态：未开始 | 设计变更集应用失败的回滚或部分失败处理策略。

### 十五、核心高语义工具实现计划

- [ ] 状态：未开始 | 实现 `getWorkspaceContext`，返回离线模式、当前项目、当前 tab、当前节点、语言等上下文。
- [ ] 状态：未开始 | 实现 `searchProjects`，用于搜索本地离线项目。
- [ ] 状态：未开始 | 实现 `openProject`，仅负责打开本地离线项目并切换工作区。
- [ ] 状态：未开始 | 实现 `searchNodes`，支持关键词、节点类型、方法、路径等搜索条件。
- [ ] 状态：未开始 | 实现 `listNodeTree`，支持按父节点、深度和节点类型读取项目树。
- [ ] 状态：未开始 | 实现 `getNodeDetail`，按 nodeId 读取节点详情，并按类型返回摘要化结构。
- [ ] 状态：未开始 | 实现 `getDeletedNodes`，读取本地回收站节点。
- [ ] 状态：未开始 | 实现 `createDesignChange`，生成创建项目结构和 API 节点的变更集，不直接写入数据。
- [ ] 状态：未开始 | 实现 `updateDesignChange`，生成节点更新变更集，支持统一 patch，不拆字段级工具。
- [ ] 状态：未开始 | 实现 `moveNodesChange`，生成节点移动变更集。
- [ ] 状态：未开始 | 实现 `deleteNodesChange`，生成节点删除变更集。
- [ ] 状态：未开始 | 实现 `restoreNodesChange`，生成节点恢复变更集。
- [ ] 状态：未开始 | 实现 `updateVariablesChange`，生成变量创建、修改、删除变更集。
- [ ] 状态：未开始 | 实现 `updateCommonHeadersChange`，生成公共 Header 创建、修改、删除变更集。
- [ ] 状态：未开始 | 实现 `previewChangeSet`，校验并返回可展示 diff。
- [ ] 状态：未开始 | 实现 `applyChangeSet`，在用户审批后应用变更集。
- [ ] 状态：未开始 | 实现 `discardChangeSet`，丢弃变更集。

### 十六、运行类工具实现计划

- [ ] 状态：未开始 | 设计并实现 `sendHttpRequest`，用于发送当前或指定 HTTP 请求。
- [ ] 状态：未开始 | 设计并实现 `manageMockServer`，统一处理 HTTP/WebSocket Mock 的启动、停止、状态读取。
- [ ] 状态：未开始 | 设计并实现 `manageWebSocketConnection`，统一处理连接、发送消息、断开连接。
- [ ] 状态：未开始 | 为运行类工具设置 `effect: 'runtime'` 和合适的 `riskLevel`。
- [ ] 状态：未开始 | 明确运行类工具是否需要用户审批，启动服务、发送请求、连接 WebSocket 默认需要审批。

### 十七、工具审批与 UI 展示

- [ ] 状态：未开始 | 设计审批卡片 UI，用于展示待审批工具、输入参数、影响范围和风险等级。
- [ ] 状态：未开始 | 设计变更集预览 UI，用于展示新增、修改、删除、移动的 diff。
- [ ] 状态：未开始 | 实现批准操作，批准后继续执行 `applyChangeSet` 或运行类工具。
- [ ] 状态：未开始 | 实现拒绝操作，拒绝后工具不执行，Agent 输出用户已取消。
- [ ] 状态：未开始 | 实现审批期间停止执行，停止后不得继续调用后续工具。
- [ ] 状态：未开始 | 将 `requiresApproval` 对接 AI SDK 6 工具审批能力。
- [ ] 状态：未开始 | 工具执行结果展示应使用摘要，不直接展示超大 JSON。

### 十八、AI SDK 6 工具适配

- [ ] 状态：未开始 | 实现新 `AgentToolDefinition` 到 AI SDK 6 tool 的适配器。
- [ ] 状态：未开始 | 将 `inputSchema` 映射到 AI SDK 6 tool schema。
- [ ] 状态：未开始 | 将 `requiresApproval` 映射到 AI SDK 6 approval 能力。
- [ ] 状态：未开始 | 将 `AgentToolResult` 转换为模型可读的稳定摘要。
- [ ] 状态：未开始 | 在 AI SDK 6 ToolLoopAgent 中只暴露新高语义工具，不暴露旧字段级工具。
- [ ] 状态：未开始 | 保留预筛选能力，但目标是新工具数量足够少时可以取消工具选择 LLM。
- [ ] 状态：未开始 | 设置合理最大循环步数，默认不超过 20 到 30 步。

### 十九、旧 Agent 工具逻辑移除

- [ ] 状态：未开始 | 移除 `simpleCreateHttpNode`、`createHttpNode`、`batchCreateHttpNodes` 等旧 HTTP 创建类 Agent 工具注册。
- [ ] 状态：未开始 | 移除所有 `patchHttpNode*`、`addHttpNode*`、`updateHttpNode*`、`deleteHttpNode*`、`setHttpNode*` 等旧 HTTP 字段级 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧 HTTP Mock 创建和更新类 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧 WebSocket 创建和更新类 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧节点重命名、移动、删除、恢复类 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧变量创建、修改、删除类 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧公共 Header 创建、修改、删除类 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧 Mock 服务和 WebSocket 连接相关 Agent 工具注册。
- [ ] 状态：未开始 | 删除旧 Agent 工具选择逻辑，不再使用字段级工具预筛选。
- [ ] 状态：未开始 | 删除旧手写 tool call 合并和执行循环逻辑。
- [ ] 状态：未开始 | 检查旧 Agent 工具文件是否仍被非 Agent 入口引用；无引用则删除。
- [ ] 状态：未开始 | MCP 如仍需工具能力，单独建立 MCP 专用工具注册，不与 Agent 工具复用旧字段级注册。

### 二十、新工具系统测试

- [ ] 状态：未开始 | 测试在线模式下所有新工具都拒绝执行。
- [ ] 状态：未开始 | 测试 `getWorkspaceContext` 在离线模式返回正确上下文。
- [ ] 状态：未开始 | 测试 `searchNodes` 和 `getNodeDetail` 返回摘要化结果。
- [ ] 状态：未开始 | 测试 `createDesignChange` 只生成变更集，不直接修改 IndexedDB。
- [ ] 状态：未开始 | 测试 `updateDesignChange` 只生成变更集，不直接修改 IndexedDB。
- [ ] 状态：未开始 | 测试 `previewChangeSet` 能展示准确 diff。
- [ ] 状态：未开始 | 测试用户批准后 `applyChangeSet` 才写入 IndexedDB。
- [ ] 状态：未开始 | 测试用户拒绝后变更集不写入 IndexedDB。
- [ ] 状态：未开始 | 测试 `applyChangeSet` 失败时返回明确错误，并且 UI 不挂起。
- [ ] 状态：未开始 | 测试运行类工具审批通过后才执行。
- [ ] 状态：未开始 | 测试新工具系统下创建 HTTP 接口的完整 Agent 流程。
- [ ] 状态：未开始 | 测试新工具系统下修改当前接口的完整 Agent 流程。
- [ ] 状态：未开始 | 测试新工具系统下删除节点的完整 Agent 流程。
- [ ] 状态：未开始 | 测试新工具系统下变量变更的完整 Agent 流程。
- [ ] 状态：未开始 | 测试新工具系统与 AI SDK 6 ToolLoopAgent 集成后可稳定完成多工具任务。

### 二十一、阶段拆分与替换策略

- [ ] 状态：未开始 | 明确阶段 0 范围：移除旧 Agent 工具逻辑和旧字段级工具注册入口。
- [ ] 状态：未开始 | 明确阶段 1 范围：固定运行边界，包括 AI 仅离线可用、默认模型 `deepseek-v4-pro`、AI SDK 6 基础接入。
- [ ] 状态：未开始 | 明确阶段 2 范围：建设新工具协议，包括 `AgentToolDefinition`、`AgentToolContext`、`AgentToolResult`、`ChangeSet`。
- [ ] 状态：未开始 | 明确阶段 3 范围：只实现只读工具，让 Agent 能安全读取上下文、项目、节点和回收站。
- [ ] 状态：未开始 | 明确阶段 4 范围：实现 changeSet 草案工具，只生成变更集，不写入 IndexedDB。
- [ ] 状态：未开始 | 明确阶段 5 范围：实现审批、预览和 `applyChangeSet`，用户批准后才写入 IndexedDB。
- [ ] 状态：未开始 | 明确阶段 6 范围：将 Agent 默认执行链路接入新工具系统。
- [ ] 状态：未开始 | 明确阶段 7 范围：补齐运行类工具，包括发送 HTTP 请求、Mock 服务管理、WebSocket 连接管理。
- [ ] 状态：未开始 | 明确阶段 8 范围：收尾验证，清理无引用旧代码，执行类型检查和关键 E2E。
- [ ] 状态：未开始 | 新增配置或常量，明确当前 Agent 工具系统版本为新工具系统。
- [ ] 状态：未开始 | 为每个阶段定义失败处理方式和继续执行条件。
- [ ] 状态：未开始 | 为每个阶段定义最小验收测试集合。
- [ ] 状态：未开始 | 阶段切换时保留用户原有对话记录，不破坏历史缓存。
- [ ] 状态：未开始 | 移除旧 tool-call 消息展示依赖，消息展示仅支持新工具系统输出。
- [ ] 状态：未开始 | 删除旧 `rawTools` 的 Agent 注册用法。
- [ ] 状态：未开始 | 确认 MCP 对旧工具的依赖清单，如有需要则独立迁移为 MCP 专用工具。

### 二十二、依赖与模型配置

- [ ] 状态：未开始 | 安装并锁定 AI SDK 6 相关依赖版本。
- [ ] 状态：未开始 | 安装并锁定 `@ai-sdk/openai-compatible` 依赖版本。
- [ ] 状态：未开始 | 确认 AI SDK 6 在当前 Node、Vite、Electron renderer、Electron main 环境下可正常构建。
- [ ] 状态：未开始 | 确认 AI SDK 6 引入后的 bundle 体积影响。
- [ ] 状态：未开始 | 确认 AI SDK 6 和相关 provider 的开源 license 符合项目要求。
- [x] 状态：已完成 | DeepSeek 官网确认 V4 API model id 为 `deepseek-v4-pro` 和 `deepseek-v4-flash`。
- [ ] 状态：未开始 | 将默认模型配置更新为 `deepseek-v4-pro`。
- [x] 状态：已完成 | `.env` 中 DeepSeek API Key 变量名为 `DEEPSEEK_API_KEY`。
- [x] 状态：已完成 | `.env` 中 DeepSeek baseURL 变量名为 `DEEPSEEK_BASE_URL`。
- [x] 状态：已完成 | `.env` 中 DeepSeek model 变量名为 `DEEPSEEK_MODEL`。
- [ ] 状态：未开始 | 明确 Electron 主进程和渲染进程如何读取 DeepSeek 配置。
- [ ] 状态：未开始 | 明确 Web 模式是否允许读取或使用真实 DeepSeek API Key。
- [ ] 状态：未开始 | 测试自定义 baseURL、customHeaders、extraBody 在 AI SDK 6 provider 中是否完整生效。

### 二十三、安全与密钥保护

- [ ] 状态：未开始 | 确认真实 DeepSeek API Key 不会输出到控制台日志。
- [ ] 状态：未开始 | 确认真实 DeepSeek API Key 不会出现在 Playwright trace、截图、错误快照中。
- [ ] 状态：未开始 | 确认真实 DeepSeek API Key 不会进入 analytics 或错误上报。
- [ ] 状态：未开始 | 确认 AI 请求体和响应体中的敏感信息不会进入普通日志。
- [x] 状态：已完成 | AI Key 继续允许存储在 localStorage。
- [ ] 状态：未开始 | 记录继续使用 localStorage 存储 AI Key 的风险和后续改进计划。
- [ ] 状态：未开始 | 检查本地数据备份导出是否包含 AI Key。
- [ ] 状态：未开始 | 如果备份导出包含 AI Key，需要增加脱敏或显式确认机制。
- [ ] 状态：未开始 | 检查对话缓存是否可能保存用户敏感输入。
- [ ] 状态：未开始 | 为 AI 请求错误信息增加脱敏处理。
- [ ] 状态：未开始 | 为测试日志增加 API Key 脱敏断言。

### 二十四、测试数据准备与清理

- [ ] 状态：未开始 | 设计 AI E2E 测试项目命名前缀。
- [ ] 状态：未开始 | 设计 AI E2E 测试节点命名前缀。
- [ ] 状态：未开始 | 设计 AI E2E 测试变量命名前缀。
- [ ] 状态：未开始 | 每个测试开始前创建独立离线测试项目。
- [ ] 状态：未开始 | 每个测试结束后清理测试项目、节点、变量、Mock 日志和对话缓存。
- [ ] 状态：未开始 | 测试失败后提供可重复执行的清理脚本或清理 fixture。
- [ ] 状态：未开始 | 清理逻辑不得删除非测试前缀的数据。
- [ ] 状态：未开始 | 测试运行前检查当前网络模式并强制切换到离线模式。
- [ ] 状态：未开始 | 测试运行后恢复原网络模式。
- [ ] 状态：未开始 | 测试运行后恢复原 AI 配置或明确保留测试配置。
- [ ] 状态：未开始 | 测试运行后关闭可能启动的 Mock 服务和 WebSocket 连接。
- [ ] 状态：未开始 | 增加 IndexedDB 数据污染检查。

### 二十五、变更集事务与幂等性

- [ ] 状态：未开始 | 明确 `applyChangeSet` 是否要求全部 operation 原子成功。
- [ ] 状态：未开始 | 如果不支持完全原子，需要定义部分成功状态和 UI 呈现方式。
- [ ] 状态：未开始 | 在 `applyChangeSet` 前生成受影响数据快照。
- [ ] 状态：未开始 | 设计 `applyChangeSet` 失败后的恢复策略。
- [ ] 状态：未开始 | 设计 `applyChangeSet` 重复调用的幂等策略。
- [ ] 状态：未开始 | 已应用的 changeSet 再次 apply 时应拒绝或返回已应用状态。
- [ ] 状态：未开始 | 已丢弃的 changeSet 不允许 apply。
- [ ] 状态：未开始 | changeSet 中引用不存在的 nodeId 时必须校验失败。
- [ ] 状态：未开始 | changeSet 中 parentId 指向非 folder 节点时必须校验失败。
- [ ] 状态：未开始 | changeSet 中删除节点时必须明确是否级联删除子节点。
- [ ] 状态：未开始 | changeSet 中移动节点时必须防止循环父子关系。
- [ ] 状态：未开始 | changeSet 应记录执行前后的节点摘要，方便 UI 和测试断言。

### 二十六、Prompt 重构

- [ ] 状态：未开始 | 重写 Agent system prompt，明确离线模式限制。
- [ ] 状态：未开始 | 重写 Agent system prompt，明确必须优先读取上下文再生成变更集。
- [ ] 状态：未开始 | 重写 Agent system prompt，明确禁止直接修改数据，必须走 changeSet。
- [ ] 状态：未开始 | 重写工具使用说明 prompt，解释 read、propose、write、runtime 工具差异。
- [ ] 状态：未开始 | 重写工具使用说明 prompt，解释审批规则和风险等级。
- [ ] 状态：未开始 | 重写变更集工作流 prompt，要求 `create/update/delete` 先 preview 再 apply。
- [ ] 状态：未开始 | 移除或弱化旧字段级工具选择 prompt。
- [ ] 状态：未开始 | 保留多语言规则，确保回复语言和用户输入一致。
- [ ] 状态：未开始 | 保留 ID 不可伪造规则，要求通过搜索或详情工具获取真实 id。
- [ ] 状态：未开始 | 为 `deepseek-v4-pro` 验证 prompt 是否能稳定触发工具调用。
- [ ] 状态：未开始 | 为新 prompt 增加真实 DeepSeek API 回归测试。

### 二十七、风险等级与审批矩阵

- [ ] 状态：未开始 | 定义 `effect: 'read'` 工具默认无需审批。
- [ ] 状态：未开始 | 定义 `effect: 'propose'` 工具默认无需审批，但必须展示变更草案。
- [ ] 状态：未开始 | 定义 `effect: 'write'` 工具必须审批。
- [ ] 状态：未开始 | 定义 `effect: 'runtime'` 工具默认需要审批。
- [ ] 状态：未开始 | 定义删除、恢复、批量修改、启动服务、发送请求、连接 WebSocket 的默认风险等级。
- [ ] 状态：未开始 | `riskLevel: 'low'` 的工具应展示简短说明。
- [ ] 状态：未开始 | `riskLevel: 'medium'` 的工具应展示影响范围。
- [ ] 状态：未开始 | `riskLevel: 'high'` 的工具应展示明确确认按钮和影响列表。
- [ ] 状态：未开始 | 高风险工具不得自动执行，即使模型请求也必须等待用户审批。
- [ ] 状态：未开始 | 审批记录应保存在当前对话消息中，便于用户回看。
- [ ] 状态：未开始 | 拒绝审批后，Agent 不得换用其他写工具绕过审批。

### 二十八、DeepSeek 协议兼容细节测试

- [ ] 状态：未开始 | 非流式 `tool_calls` 返回时，Agent 能正确解析工具名和 arguments。
- [ ] 状态：未开始 | 流式 `tool_calls` 返回时，Agent 能正确合并分片 arguments。
- [ ] 状态：未开始 | 流式响应包含 `reasoning_content` 时，UI 不应把内部推理误当最终回答。
- [ ] 状态：未开始 | `finish_reason = tool_calls` 时，Agent 必须进入工具执行流程。
- [ ] 状态：未开始 | `finish_reason = stop` 且 content 为空时，Agent 应给出兜底提示。
- [ ] 状态：未开始 | `finish_reason = length` 时，Agent 应提示输出被截断。
- [ ] 状态：未开始 | `finish_reason = insufficient_system_resource` 时，Agent 应提示可重试。
- [ ] 状态：未开始 | DeepSeek 返回 tool arguments 为非法 JSON 时，工具不得执行。
- [ ] 状态：未开始 | DeepSeek 返回 schema 之外的字段时，应忽略或校验失败。
- [ ] 状态：未开始 | DeepSeek 返回不存在的工具名时，应展示工具不存在错误。
- [ ] 状态：未开始 | DeepSeek 返回多个 tool_calls 时，应按顺序执行或按设计明确并行策略。
- [ ] 状态：未开始 | DeepSeek 返回重复 tool_call id 时，应去重或稳定处理。
- [ ] 状态：未开始 | DeepSeek SSE 中断在半个 JSON 参数中时，UI 不应卡死。
- [ ] 状态：未开始 | DeepSeek 请求超时后，Agent 状态必须恢复为完成。
- [ ] 状态：未开始 | DeepSeek 429 或限流时，应展示明确错误，不自动无限重试。
- [ ] 状态：未开始 | DeepSeek 401 或 403 时，应提示 API Key 或权限问题。
- [ ] 状态：未开始 | DeepSeek 余额不足或计费错误时，应展示可读错误。
- [ ] 状态：未开始 | `thinking.enabled/disabled` 配置变化时，Agent 行为符合预期。
- [ ] 状态：未开始 | `response_format: json_object` 场景下必须包含明确 JSON 输出指令。

### 二十九、Agent 循环与状态机测试

- [ ] 状态：未开始 | Agent 达到最大 step 后停止，且不再执行新工具。
- [ ] 状态：未开始 | Agent 连续调用同一个只读工具超过阈值时，应停止或提示无法推进。
- [ ] 状态：未开始 | Agent 连续生成相同 changeSet 时，应避免重复申请审批。
- [ ] 状态：未开始 | Agent 在工具失败后能根据错误信息决定重试或停止。
- [ ] 状态：未开始 | Agent 在工具失败且 `retryable=false` 时不应继续重试。
- [ ] 状态：未开始 | Agent 在工具失败且缺少参数时，应向用户追问而不是猜 ID。
- [ ] 状态：未开始 | Agent 中途取消后，后续 DeepSeek 流和工具执行结果不得继续写入 UI。
- [ ] 状态：未开始 | Agent 多轮对话应保留必要历史，但不能无限增长。
- [ ] 状态：未开始 | Agent 历史消息裁剪后仍保留最近工具结果摘要。
- [ ] 状态：未开始 | Agent 不应把上一轮被拒绝的操作在下一轮自动执行。
- [ ] 状态：未开始 | Agent 在在线模式切换期间应立即中断循环。
- [ ] 状态：未开始 | Agent 在项目上下文丢失后应停止写操作并提示重新选择项目。

### 三十、工具注册与权限边界测试

- [ ] 状态：未开始 | 旧 Agent 工具逻辑移除后，新功能不得注册到旧 `rawTools`。
- [ ] 状态：未开始 | 新 Agent 默认只暴露高语义工具，不暴露字段级工具。
- [ ] 状态：未开始 | 工具名必须满足 DeepSeek function name 规则和长度限制。
- [ ] 状态：未开始 | 工具 description 不应包含过长业务文档，避免上下文膨胀。
- [ ] 状态：未开始 | 工具 inputSchema 必须包含 `additionalProperties: false` 或等效校验策略。
- [ ] 状态：未开始 | 工具 schema 中必填字段必须和运行时校验一致。
- [ ] 状态：未开始 | 工具返回给模型的结果必须是摘要，不返回完整节点大对象。
- [ ] 状态：未开始 | 工具返回的错误必须包含稳定 error code。
- [ ] 状态：未开始 | read 工具不需要审批。
- [ ] 状态：未开始 | propose 工具只生成 changeSet，不直接写入数据。
- [ ] 状态：未开始 | write 和 runtime 工具必须审批。
- [ ] 状态：未开始 | 在线模式下所有工具统一返回 `AI_OFFLINE_ONLY` 或等效错误码。
- [ ] 状态：未开始 | 新工具系统接入后，MCP 工具注册不应继续依赖 Agent 工具注册。
- [ ] 状态：未开始 | 移除旧 Agent 工具逻辑后，Agent 工具列表只包含新高语义工具。

### 三十一、上下文与 ID 防伪测试

- [ ] 状态：未开始 | 没有当前项目时，创建节点应先提示选择或创建项目。
- [ ] 状态：未开始 | 有当前项目时，Agent 使用真实 `projectId`，不伪造。
- [ ] 状态：未开始 | 当前 tab 是 HTTP 节点时，“当前接口”应解析为该 nodeId。
- [ ] 状态：未开始 | 当前 tab 是 folder 时，“在当前文件夹下创建接口”应使用该 folderId。
- [ ] 状态：未开始 | 当前 tab 是 WebSocket 时，HTTP 修改工具不得误用。
- [ ] 状态：未开始 | 用户提供不存在的 nodeId 时，Agent 应先搜索或提示不存在。
- [ ] 状态：未开始 | 用户只提供节点名称且存在多个同名节点时，Agent 应询问或列出候选。
- [ ] 状态：未开始 | 用户要求“删除这个”但上下文不明确时，Agent 不应删除任何节点。
- [ ] 状态：未开始 | 用户要求跨项目操作时，Agent 必须明确目标项目。
- [ ] 状态：未开始 | 切换项目后，历史上下文中的旧 projectId 不得继续用于写操作。
- [ ] 状态：未开始 | 节点被外部删除后，changeSet apply 前必须重新校验。
- [ ] 状态：未开始 | parentId 指向非文件夹节点时，changeSet 校验失败。
- [ ] 状态：未开始 | 移动节点不能移动到自身或子节点下。

### 三十二、ChangeSet 生命周期细节测试

- [ ] 状态：未开始 | 创建 changeSet 后，IndexedDB 不发生业务数据写入。
- [ ] 状态：未开始 | preview changeSet 后，状态变为 `previewed`。
- [ ] 状态：未开始 | apply 前必须处于可应用状态。
- [ ] 状态：未开始 | 用户批准后 apply 才写入 IndexedDB。
- [ ] 状态：未开始 | 用户拒绝后状态变为 `discarded` 或等效状态。
- [ ] 状态：未开始 | discarded changeSet 不允许再次 apply。
- [ ] 状态：未开始 | applied changeSet 重复 apply 应拒绝或返回已应用。
- [ ] 状态：未开始 | failed changeSet 应保留错误详情。
- [ ] 状态：未开始 | changeSet 包含多个 operation 时，diff 顺序稳定。
- [ ] 状态：未开始 | changeSet diff 能展示新增节点名称、类型、路径。
- [ ] 状态：未开始 | changeSet diff 能展示修改前后字段。
- [ ] 状态：未开始 | changeSet diff 能展示删除影响范围。
- [ ] 状态：未开始 | changeSet diff 能展示移动前后父节点。
- [ ] 状态：未开始 | changeSet apply 前后记录摘要，便于审计和 UI 展示。
- [ ] 状态：未开始 | changeSet 失败后，不应残留半成品 UI 状态。
- [ ] 状态：未开始 | 批量 operation 部分失败时，状态和 UI 必须明确。
- [ ] 状态：未开始 | changeSet 中包含高风险 operation 时，审批卡片显示高风险。
- [ ] 状态：未开始 | changeSet 过期或上下文变化后，应要求重新 preview。
- [ ] 状态：未开始 | changeSet 在网络模式切换到 online 后不得 apply。

### 三十三、审批流程细节测试

- [ ] 状态：未开始 | 高风险工具必须显示审批卡片。
- [ ] 状态：未开始 | 审批卡片应展示工具名称、风险等级、影响范围。
- [ ] 状态：未开始 | 审批卡片应展示关键参数，但敏感值要脱敏。
- [ ] 状态：未开始 | 批准后只执行当前审批项。
- [ ] 状态：未开始 | 拒绝后不执行工具。
- [ ] 状态：未开始 | 拒绝后 Agent 不得调用另一个写工具绕过审批。
- [ ] 状态：未开始 | 审批期间用户点击停止，应取消待审批状态。
- [ ] 状态：未开始 | 审批期间再次发送消息，应阻止或提示当前有待处理审批。
- [ ] 状态：未开始 | 多个审批项应按顺序处理。
- [ ] 状态：未开始 | 审批结果应记录在对话消息中。
- [ ] 状态：未开始 | 已审批 tool call 不应因流式重放重复执行。
- [ ] 状态：未开始 | 浏览器刷新后，未完成审批应失效或进入可恢复状态。
- [ ] 状态：未开始 | 在线模式下不展示审批卡片，因为 AI 功能不可用。

### 三十四、AI UI 状态细节测试

- [ ] 状态：未开始 | Agent 发送后输入框清空。
- [ ] 状态：未开始 | Agent working 状态下发送按钮隐藏或禁用。
- [ ] 状态：未开始 | 停止按钮只在 working 状态展示。
- [ ] 状态：未开始 | 工具 loading 时展示加载图标。
- [ ] 状态：未开始 | 工具 success 后自动折叠详情。
- [ ] 状态：未开始 | 工具 error 后展示错误详情。
- [ ] 状态：未开始 | 工具参数 JSON 展示格式正确。
- [ ] 状态：未开始 | 工具结果过长时 UI 有高度限制，不撑爆面板。
- [ ] 状态：未开始 | changeSet 预览过长时 UI 可滚动。
- [ ] 状态：未开始 | AI 面板关闭再打开后，当前对话状态仍正确。
- [ ] 状态：未开始 | 清空对话时，中断正在执行的 Agent。
- [ ] 状态：未开始 | 网络模式切换 online 时，AI 面板关闭或禁用。
- [ ] 状态：未开始 | 在线模式下不展示 AI 设置页入口。
- [ ] 状态：未开始 | 离线模式下 AI 设置页入口正常展示。
- [ ] 状态：未开始 | API Key 未配置时展示配置提示。
- [ ] 状态：未开始 | API Key 已配置但模型错误时展示模型错误。
- [ ] 状态：未开始 | 多语言错误提示使用当前语言。
- [ ] 状态：未开始 | 消息列表滚动到底部行为正常。
- [ ] 状态：未开始 | Markdown 渲染不执行危险 HTML 或脚本。

### 三十五、真实 API 成本、安全与离线数据测试

- [ ] 状态：未开始 | 每轮真实 DeepSeek 测试记录调用次数。
- [ ] 状态：未开始 | 每轮真实 DeepSeek 测试记录 token usage，如果 API 返回。
- [ ] 状态：未开始 | 测试失败时输出脱敏后的请求摘要。
- [ ] 状态：未开始 | 测试超时时不重试超过设定次数。
- [ ] 状态：未开始 | 需要 tool calling 的测试使用低成本最短 prompt。
- [ ] 状态：未开始 | 长上下文测试单独标记为高成本，不默认运行。
- [ ] 状态：未开始 | 真实 API 不稳定导致失败时，应能区分产品 bug 和外部服务失败。
- [ ] 状态：未开始 | CI 环境缺少 API Key 时，真实 API 测试标记跳过或阻塞。
- [ ] 状态：未开始 | 本地运行真实 API 测试前提示会消耗额度。
- [ ] 状态：未开始 | 不允许把真实 API 响应快照完整提交到仓库。
- [ ] 状态：未开始 | 在线模式下 Agent 不读取在线项目数据。
- [ ] 状态：未开始 | 在线模式下 Agent 不写在线项目数据。
- [ ] 状态：未开始 | 离线模式下 Agent 只操作 IndexedDB。
- [ ] 状态：未开始 | 离线测试数据不会污染真实用户项目。
- [ ] 状态：未开始 | 本地备份导出不应无提示包含 API Key。
- [ ] 状态：未开始 | 对话缓存清理后不残留用户输入。
- [ ] 状态：未开始 | Agent 工具错误不应泄露 API Key。
- [ ] 状态：未开始 | 工具结果摘要不应包含敏感 header 原值，如 Authorization。
- [ ] 状态：未开始 | 审批卡片展示 Authorization 时应脱敏。
- [ ] 状态：未开始 | 变量值为 token、password、key 时应脱敏展示。
