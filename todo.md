# Vercel AI SDK 6 Agent 重构 TODO

## 目标

将现有手写 Agent 循环重构为 Vercel AI SDK 6 `ToolLoopAgent`，建立离线优先、高语义工具、ChangeSet、审批、完整事件流和可恢复面板展示。

AI 面板的数据组织、事件映射、组件层级和交互效果参考 `D:\webs\example\apps\client\src\agent\panel`，参考基线 commit 为 `e1111adea3938fcb0cbcac19570a42c4011c7d85`。参考项目使用 AI SDK 7，仅参考事件与 UI 设计，不直接复制依赖版本和运行时代码。

## 验收规则

1. 本次固定使用 AI SDK 6；当前 Electron 32 内置 Node 20，不将要求 Node 22 的 AI SDK 7 纳入本次迁移。
2. Agent 和 Ask 仅在 Electron 离线模式可用；在线模式和 Web 构建不得打开 AI 面板、读取 AI Key、发送模型请求或执行工具。
3. `ToolLoopAgent`、模型 Provider 和 Agent 循环运行在 Electron main；renderer 只负责 UI、IndexedDB、Pinia 和经过类型校验的 client tool command。
4. Agent 工具系统必须是离线优先、少工具、高语义、可审批、ChangeSet 驱动的设计，不复刻旧字段级工具拆分。
5. 所有数据写入必须先生成并预览 ChangeSet；只有 `applyChangeSet` 获得用户批准后才允许写入 IndexedDB。
6. AI SDK 原生 tool approval 是唯一执行审批入口，ChangeSet 预览作为审批载荷，不再实现第二套相互独立的确认状态机。
7. DeepSeek 使用 `@ai-sdk/deepseek`；Qwen 和 Custom Provider 使用 `@ai-sdk/openai-compatible`，不得因 Agent 迁移破坏现有 Provider 能力。
8. 默认模型统一为 `deepseek-v4-pro`；真实 API smoke 测试允许显式覆盖为 `deepseek-v4-flash` 以控制成本。
9. 面板必须覆盖本 TODO 定义的全部 Agent 事件、所有 run 终态、所有 tool 终态、审批、取消、错误和 ChangeSet 生命周期。
10. 确定性协议、状态机、异常和 UI 测试使用 `ai/test`、可控流或测试 transport；少量 smoke E2E 使用真实 DeepSeek API。
11. 真实 API 测试不得由本地 mock server 冒充；缺少真实 API Key 时只跳过带 `live-api` 标签的测试，不阻塞确定性测试。
12. 新增文案只能使用 `t()`，并同步更新 `src/renderer/i18n/zh-cn.ts` 和 `src/renderer/i18n/en.ts`。
13. 新增代码禁止使用 `any`、`enum`、行内样式、`console.log` 调试代码和不存在的 CSS 变量；图标统一使用 `lucide-vue-next`。
14. 禁止修改 `share.html` 和 `testData.ts`，禁止执行任何 `git restore` 命令。
15. 切换到新 Agent 后立即删除旧 Agent 执行入口，不保留长期双链路和运行时回退开关。
16. P0、P1 item 全部完成，类型检查、关键确定性测试和真实 API smoke 测试通过后，才视为迁移验收完成。
17. `D:\webs\example` 只作为本地设计参考；Apiflow 的源码、构建和测试不得导入、读取或依赖该目录。

## 执行规则

1. item 使用 `P0`、`P1` 标记优先级；P0 是进入下一阶段前必须完成的阻塞项。
2. 每完成一个 item，立即将“未开始”更新为“已完成”，并在 item 后记录验证命令或证据。
3. 外部条件导致无法完成时标记为“阻塞”，写明原因、缺少条件和解除方式。
4. 阶段必须按顺序推进；每个阶段的 Gate 通过后才能进入下一阶段。
5. 所有类型定义放在 `packages/web/src/types/`，单处使用的局部状态类型可按项目规范内联。
6. 纯映射、状态机和 Provider contract 测试允许使用 `ai/test` 和可控输入；不得为了通过测试削弱断言。
7. E2E 尽量通过用户操作完成流程，不直接调用业务 store 绕过 UI；测试专用 transport 只能用于注入模型或 IPC 事件。
8. 运行任何 Playwright 测试前必须先执行 `npm --prefix packages/web run pretest:e2e`。
9. 代码修改后必须执行 `npm run web:type-check`；不要在仓库根目录执行不存在的 `npm run type-check`。
10. 真实 API 测试必须记录测试目的、调用次数和 token usage，不允许提交完整响应快照。
11. 不允许在代码、事件、缓存、日志、trace、截图或错误信息中输出真实 API Key、Authorization 或敏感变量原值。
12. 每个阶段完成后检查 Agent 注册、Provider、IPC、事件映射、UI、缓存、i18n 和测试是否同步更新。

## TODO List

### 零、已确认决策

- [x] P0 | 状态：已完成 | SDK 目标固定为 AI SDK 6，参考项目 AI SDK 7 仅作为事件和 UI 基线。
- [x] P0 | 状态：已完成 | Agent runtime 位于 Electron main，renderer 通过 IPC 接收事件并执行 client tool command。
- [x] P0 | 状态：已完成 | 本次 AI 功能边界固定为 Electron 离线模式；在线模式和 Web 构建不提供 AI 助手。
- [x] P0 | 状态：已完成 | DeepSeek V4 model id 为 `deepseek-v4-pro` 和 `deepseek-v4-flash`。
- [x] P0 | 状态：已完成 | `.env` 使用 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`。
- [x] P1 | 状态：已完成 | 本次继续允许 AI Key 存储在 localStorage，并要求记录风险、限制导出和统一脱敏。

### 一、依赖与运行边界

- [ ] P0 | 状态：未开始 | 在 `packages/web` 精确锁定兼容 Node 20 的 AI SDK 6 依赖，不使用 `^` 或 `~` 漂移主要 AI 包版本。
- [ ] P0 | 状态：未开始 | 安装并锁定 `ai@6.0.273`、`@ai-sdk/deepseek@2.0.62`、`@ai-sdk/openai-compatible@2.0.74`、`zod@4.5.4`，并更新 `package-lock.json`。
- [ ] P0 | 状态：未开始 | 验证 AI SDK 依赖在 Electron 32 main、Vite 8、TypeScript 5.6 环境下可以构建和运行。
- [ ] P0 | 状态：未开始 | 明确 AI SDK 只打入 main bundle，renderer 不重复打包 Provider 和 Agent runtime。
- [ ] P0 | 状态：未开始 | 定义 main 与 renderer 的 AI IPC request、event、response、approval、abort 协议，所有 payload 都有运行时校验。
- [ ] P0 | 状态：未开始 | IPC 协议统一携带 `conversationId`、`runId`、`messageId`、`toolCallId`、`approvalId` 和单调递增 `sequence`。
- [ ] P0 | 状态：未开始 | 定义 renderer 销毁、窗口关闭、切换 online、清空会话时 main 中 run 的终止规则。
- [ ] P1 | 状态：未开始 | 检查 AI SDK 6、Provider 和 Zod license 是否符合项目要求。
- [ ] P1 | 状态：未开始 | 记录 main 与 renderer bundle 体积基线和迁移后的变化。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 最小 `ToolLoopAgent` 在 Electron main 中使用测试模型完成一次文本生成，renderer 能收到开始、文本和完成事件。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 二、Provider 与配置迁移

- [ ] P0 | 状态：未开始 | 在 main 建立 Provider factory：DeepSeek 使用 `@ai-sdk/deepseek`，Qwen 和 Custom 使用 `@ai-sdk/openai-compatible`。
- [ ] P0 | 状态：未开始 | 将 DeepSeek 官方 baseURL 改为 Provider 所需的 API 前缀，不再把 `/chat/completions` 完整请求路径直接传给 Provider factory。
- [ ] P0 | 状态：未开始 | 将 Qwen 和 Custom baseURL 语义统一为 Provider 前缀，并明确非标准完整 endpoint 的处理方式。
- [ ] P0 | 状态：未开始 | 将 LLM Provider cache 升级为 v2，迁移旧的完整 `/chat/completions` 地址并保留用户的 model、apiKey 和 Custom 配置。
- [ ] P0 | 状态：未开始 | 默认 DeepSeek 模型改为 `deepseek-v4-pro`，重置配置和旧默认模型迁移结果保持一致。
- [ ] P0 | 状态：未开始 | 更新 `.env.example`，将已废弃的 `deepseek-chat` 改为 `deepseek-v4-pro`。
- [ ] P0 | 状态：未开始 | 设置页、缓存初始化、main 配置同步和测试 fixture 使用同一默认模型常量。
- [ ] P0 | 状态：未开始 | Custom Provider 的 customHeaders 映射到 Provider headers；DeepSeek 和 Qwen 官方预设继续禁止任意自定义 Header。
- [ ] P0 | 状态：未开始 | Custom Provider 的 extraBody 通过 `providerOptions` 或 request transform 注入，禁止覆盖 `model`、`messages`、`stream`、`tools` 等保留字段。
- [ ] P0 | 状态：未开始 | DeepSeek thinking 使用 Provider 支持的配置结构，不再由业务代码手动拼接或解析 `reasoning_content`。
- [ ] P0 | 状态：未开始 | Ask 使用 AI SDK 6 `streamText`，支持多轮上下文、流式文本、reasoning、错误和 AbortSignal。
- [ ] P0 | 状态：未开始 | 在线模式下 Header、快捷键、已打开面板、Ask、Agent、main IPC 和 client tool command 全部拒绝执行。
- [ ] P0 | 状态：未开始 | Web 构建隐藏 AI 入口和 AI 设置，不读取 localStorage 中的 AI Key，不调用 Web proxy 模型接口。
- [ ] P0 | 状态：未开始 | AI 设置页仅在 Electron 离线模式展示；当前代码尚未满足，不得继续标记为已完成。
- [ ] P1 | 状态：未开始 | 为 DeepSeek、Qwen、Custom Provider 增加配置保存、切换、重置和请求 contract 回归测试。
- [ ] P1 | 状态：未开始 | 验证 DeepSeek V4 Pro/Flash 的文本、thinking、JSON 输出、tool calling 和 tool streaming 能力。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 离线 Electron Ask 可正常流式回答和停止；在线模式与 Web 构建没有任何模型请求。
- [ ] P0 | 状态：未开始 | Provider cache v1 到 v2 迁移测试通过，用户配置没有丢失。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 三、Agent 事件协议与会话缓存

- [ ] P0 | 状态：未开始 | 在 `packages/web/src/types/ai/` 定义与 AI SDK 解耦的 `AgentEvent` 判别联合类型，作为 IPC、缓存和 UI 映射的唯一事件源。
- [ ] P0 | 状态：未开始 | 建立 `AI SDK stream part -> AgentEvent -> PanelUIMessage` 两级映射，禁止在单一 Vue 组件中直接堆叠所有 SDK part 判断。
- [ ] P0 | 状态：未开始 | 原生 SDK part 完整处理 `text`、`reasoning`、`step-start`、静态/动态 tool、`tool-approval-request`、`tool-approval-response`、source-url、source-document、file、error、finish 和 abort。
- [ ] P0 | 状态：未开始 | ApiFlow 自定义 data event 定义为 `run-state`、`client-tool-command`、`conversation-updated`、`change-set`、`invocation` 和 `compacting`；不得称为 AI SDK 原生事件。
- [ ] P0 | 状态：未开始 | run 状态定义为 `queued`、`running`、`waiting_client_tool`、`waiting_approval`、`waiting_user_input`、`cancelling`、`completed`、`cancelled`、`failed`、`interrupted`。
- [ ] P0 | 状态：未开始 | tool 原始状态完整接收 input streaming/available、approval requested/responded、output available/denied/error，并归一化为 created/running/success/denied/responded/error。
- [ ] P0 | 状态：未开始 | 事件按 `runId + sequence` 稳定排序，重复 `eventId`、`toolCallId` 或流式重放不会产生重复消息或重复副作用。
- [ ] P0 | 状态：未开始 | 未识别事件安全忽略并记录脱敏诊断信息，不得中断当前消息流。
- [ ] P0 | 状态：未开始 | 取消后迟到的模型 chunk、工具结果和 approval response 不得继续写入事件 store。
- [ ] P0 | 状态：未开始 | 会话缓存升级为 v2，保存规范化 `AgentEvent` 而不是 Vue UI 状态或旧 `ConversationMessage`。
- [ ] P0 | 状态：未开始 | 旧缓存迁移只保留可安全转换的用户消息和最终回答，旧字段级 tool-call 消息丢弃并记录一次迁移结果。
- [ ] P0 | 状态：未开始 | 缓存设置最大消息数、最大字节数和最近工具摘要保留规则，防止历史无限增长。
- [ ] P0 | 状态：未开始 | 面板关闭再打开保留当前 run 和审批；应用刷新或进程重启后未完成 run 标记为 interrupted，未完成审批标记为 expired。
- [ ] P1 | 状态：未开始 | conversation cache 清理同时中断 run、清理待审批状态和敏感临时数据。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 使用可控事件流覆盖全部原生 part、自定义 event、重复、乱序、迟到和未知事件场景。
- [ ] P0 | 状态：未开始 | cache v1 到 v2 迁移、容量限制和 interrupted 恢复测试通过。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 四、新 Agent 工具系统

- [ ] P0 | 状态：未开始 | 定义 `AgentToolDefinition`，包含 name、title、description、domain、effect、scope、riskLevel、requiresApproval、inputSchema、execute。
- [ ] P0 | 状态：未开始 | effect 使用 `read | navigate | propose | write | runtime` 字面量联合类型；`openProject` 等界面导航不得伪装成 read。
- [ ] P0 | 状态：未开始 | 定义 `AgentToolContext`，包含 projectId、activeNodeId、activeTabType、language、networkMode、abortSignal、conversationId、runId。
- [ ] P0 | 状态：未开始 | 定义 `AgentToolResult`，统一 success、errorCode、retryable、summary、displayData、modelData、changeSetId。
- [ ] P0 | 状态：未开始 | 所有工具 scope 固定为 offline；main 和 renderer 两端都检查 networkMode，拒绝时返回稳定 `AI_OFFLINE_ONLY`。
- [ ] P0 | 状态：未开始 | 工具 schema 使用 Zod 或兼容 JSON Schema，必填字段和运行时校验一致，并禁止额外属性或采用等效严格校验。
- [ ] P0 | 状态：未开始 | 工具名满足 DeepSeek function name 和长度限制，description 保持简短，返回给模型的数据使用稳定摘要。
- [ ] P0 | 状态：未开始 | 实现 `getWorkspaceContext`、`searchProjects`、`searchNodes`、`listNodeTree`、`getNodeDetail`、`getDeletedNodes`。
- [ ] P0 | 状态：未开始 | 实现 `openProject` client tool command，只负责导航和上下文切换，不修改业务数据。
- [ ] P0 | 状态：未开始 | main 通过 client tool command 请求 renderer 读取 IndexedDB/Pinia，renderer 校验 run、工具名、输入和离线模式后返回结果。
- [ ] P0 | 状态：未开始 | 所有 ID 必须来自当前上下文、搜索结果或执行层生成，模型不得伪造 projectId、nodeId、parentId、changeSetId。
- [ ] P0 | 状态：未开始 | 当前 tab 类型与工具 domain 不匹配时拒绝执行，WebSocket 上下文不得误用 HTTP 修改工具。
- [ ] P0 | 状态：未开始 | 使用 `activeTools` 或 `prepareStep` 按上下文限制工具集合，删除额外的“工具选择 LLM”调用。
- [ ] P0 | 状态：未开始 | MCP 建立独立工具注册和适配层，不再依赖 Agent 字段级 `rawTools`。
- [ ] P1 | 状态：未开始 | 工具大结果分别生成给模型的短摘要和给 UI 的脱敏详情，禁止直接返回完整节点大对象。
- [ ] P1 | 状态：未开始 | Prompt 明确离线限制、先读取上下文、禁止猜 ID、写操作必须先 propose ChangeSet、拒绝审批后不得换工具绕过。
- [ ] P1 | 状态：未开始 | 中文、英文、日文输入正确传递目标语言，回复和生成内容跟随最新一轮用户语言。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 只读 Agent 能查询当前项目、节点、回收站并回答，不产生业务副作用。
- [ ] P0 | 状态：未开始 | 在线模式、错误 tab、伪造 ID、重复调用和 AbortSignal 测试通过。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 五、ChangeSet 协议与事务

- [ ] P0 | 状态：未开始 | 定义 `ChangeSet`，包含 id、conversationId、runId、targetProjectId、title、description、operations、status、baseRevision、createdAt、expiresAt。
- [ ] P0 | 状态：未开始 | 创建项目场景允许 targetProjectId 为空，并通过 `createProject` operation 生成项目；项目 ID 由执行层生成，不由模型提供。
- [ ] P0 | 状态：未开始 | `ChangeOperation` 支持 createProject、createNode、updateNode、moveNode、deleteNode、restoreNode、updateVariables、updateCommonHeaders。
- [ ] P0 | 状态：未开始 | 节点创建 schema 覆盖 folder、http、websocket、httpMock、websocketMock；节点 patch 使用统一业务 schema，不拆字段级工具。
- [ ] P0 | 状态：未开始 | ChangeSet 状态定义为 draft、previewed、approved、applying、applied、discarded、failed、expired。
- [ ] P0 | 状态：未开始 | 实现 `createDesignChange`、`updateDesignChange`、`moveNodesChange`、`deleteNodesChange`、`restoreNodesChange`、`updateVariablesChange`、`updateCommonHeadersChange`。
- [ ] P0 | 状态：未开始 | propose 工具只生成 ChangeSet 并写入 ChangeSet 存储，不修改项目、节点、变量或 Header 业务数据。
- [ ] P0 | 状态：未开始 | ChangeSet 存储到 IndexedDB 独立 object store，包含版本、TTL、状态和审批关联信息。
- [ ] P0 | 状态：未开始 | 实现 `previewChangeSet`，重新读取当前数据并校验 projectId、nodeId、parentId、类型、URL、方法、参数和 baseRevision。
- [ ] P0 | 状态：未开始 | diff 稳定展示 create/update/delete/move 的目标、前后值和影响范围，敏感字段必须脱敏。
- [ ] P0 | 状态：未开始 | 实现 `applyChangeSet`，所有数据 operation 必须在同一个 IndexedDB transaction 中原子成功。
- [ ] P0 | 状态：未开始 | apply 前再次校验上下文和 baseRevision；节点已变化、ChangeSet 过期或网络切到 online 时拒绝应用。
- [ ] P0 | 状态：未开始 | apply 使用 changeSetId 保证幂等；applied/discarded/expired ChangeSet 再次 apply 返回稳定状态且不重复写入。
- [ ] P0 | 状态：未开始 | apply 失败回滚 transaction，状态变为 failed，并保留脱敏错误和执行前摘要。
- [ ] P0 | 状态：未开始 | 删除操作明确级联范围；移动操作防止移动到自身或子节点；parentId 必须指向 folder。
- [ ] P0 | 状态：未开始 | 实现 `discardChangeSet`，用户拒绝后不可再次 apply，重新执行必须生成新的 ChangeSet。
- [ ] P1 | 状态：未开始 | ChangeSet 成功应用后刷新项目树、当前 tab、变量和 Header store，缓存与 IndexedDB 保持一致。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 创建项目、创建节点、修改节点、删除、恢复、移动、变量和 Header 的 preview/apply/discard 测试通过。
- [ ] P0 | 状态：未开始 | 原子性、幂等、过期、并发修改、循环父子关系和失败回滚测试通过。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 六、AI SDK ToolLoopAgent 与审批

- [ ] P0 | 状态：未开始 | 实现 `AgentToolDefinition` 到 AI SDK 6 tool 的适配器，工具 key、description、inputSchema、execute 保持一致。
- [ ] P0 | 状态：未开始 | 将自定义 requiresApproval 映射为 AI SDK tool 的 `needsApproval`，支持基于输入和风险动态判断。
- [ ] P0 | 状态：未开始 | read、navigate、propose 默认无需审批；write 必须审批；runtime 根据 action 动态审批。
- [ ] P0 | 状态：未开始 | `applyChangeSet` 必须 `needsApproval: true`，审批卡片直接展示对应 ChangeSet preview 和风险，不再弹出第二张确认卡。
- [ ] P0 | 状态：未开始 | 按 AI SDK 审批协议处理 tool-approval-request、用户响应、tool-approval-response 和第二次 Agent 调用。
- [ ] P0 | 状态：未开始 | approvalId、toolCallId、changeSetId、runId 必须一致关联；未知、重复、过期 approval response 被拒绝。
- [ ] P0 | 状态：未开始 | 用户拒绝后工具不执行，ChangeSet 变为 discarded，模型收到拒绝结果且不得换用其他 write 工具绕过。
- [ ] P0 | 状态：未开始 | 审批期间停止、切换 online、关闭应用或清空会话后，不得继续执行工具或下一步模型调用。
- [ ] P0 | 状态：未开始 | 多个待审批工具按事件顺序逐个处理，不并行展示可同时批准的高风险操作。
- [ ] P0 | 状态：未开始 | Agent 最大步数默认 12、硬上限 20；模型请求最大重试 1 次，工具仅在 retryable=true 时允许有界重试。
- [ ] P0 | 状态：未开始 | 连续调用相同只读工具或生成相同 ChangeSet 达到阈值后停止并提示无法推进。
- [ ] P0 | 状态：未开始 | 工具参数修复只能修复格式问题，不得猜测缺失 ID 或绕过 schema、审批和离线限制。
- [ ] P1 | 状态：未开始 | 使用 AI SDK 归一化 finish reason、usage、reasoning 和 tool parts；业务层不再手动合并 DeepSeek SSE tool arguments。
- [ ] P1 | 状态：未开始 | DeepSeek raw finish reason 和错误码只在 Provider contract 测试中验证映射，不在 Agent 业务层重复解析。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 无工具、单工具、多工具、多轮工具、审批通过、审批拒绝、最大步数、失败和取消流程全部通过确定性测试。
- [ ] P0 | 状态：未开始 | tool approval 重放、重复响应、过期响应和迟到响应不会产生副作用。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 七、运行类工具

- [ ] P1 | 状态：未开始 | 实现 `sendHttpRequest`，发送前展示方法、URL、Header 脱敏摘要和潜在副作用，并要求审批。
- [ ] P1 | 状态：未开始 | 实现 `manageMockServer`，status/read action 无需审批，start/stop action 需要审批。
- [ ] P1 | 状态：未开始 | 实现 `manageWebSocketConnection`，status/read action 无需审批，connect/send/disconnect action 按风险审批。
- [ ] P1 | 状态：未开始 | 运行工具通过现有 main HTTP、Mock、WebSocket 能力执行，不复制网络和服务管理实现。
- [ ] P1 | 状态：未开始 | runtime 工具完整响应 AbortSignal，停止后不继续发送请求、启动服务、连接或发送消息。
- [ ] P1 | 状态：未开始 | 应用退出、测试结束和 run 取消时清理由测试或 Agent 启动的 Mock 服务与 WebSocket 连接。

#### 阶段 Gate

- [ ] P1 | 状态：未开始 | HTTP 请求、Mock start/stop/status、WebSocket connect/send/disconnect/status 的审批和取消测试通过。
- [ ] P1 | 状态：未开始 | `npm run web:type-check` 通过。

### 八、AI 面板与完整事件展示

- [ ] P0 | 状态：未开始 | 按参考项目拆分消息映射和 Vue 展示组件，不在 `AiChat.vue` 中继续累积所有事件模板与样式。
- [ ] P0 | 状态：未开始 | 用户消息、助手过程文本、流式回答、最终回答、thinking、reasoning、working、compacting、cancelled、error 均有独立展示组件。
- [ ] P0 | 状态：未开始 | 单 tool、tool group、agent invocation、approval 和 ChangeSet 均有独立展示组件。
- [ ] P0 | 状态：未开始 | source-url、source-document 和 file 事件展示标题、类型和安全链接；未知或不允许的协议不得生成可点击链接。
- [ ] P0 | 状态：未开始 | working 展示运行时长，completed/cancelled/failed/interrupted 后停止计时并保留终态。
- [ ] P0 | 状态：未开始 | reasoning 流式时默认展开，完成后可折叠；最终回答出现后过程内容按参考规则收起，避免重复展示。
- [ ] P0 | 状态：未开始 | 多个连续工具按 step/batch 聚合，顺序与 sequence 一致；单工具独立展示。
- [ ] P0 | 状态：未开始 | 工具卡片展示 lucide 图标、语义化名称、目标、状态、流式摘要、来源、脱敏输入、输出和错误。
- [ ] P0 | 状态：未开始 | created/running 显示加载状态，success 自动折叠，denied/responded/error 使用可区分状态和说明。
- [ ] P0 | 状态：未开始 | approval 卡片展示工具、ChangeSet diff、风险、影响范围和脱敏参数，支持批准、拒绝和停止。
- [ ] P0 | 状态：未开始 | ChangeSet 卡片完整展示 createProject/create/update/delete/move/restore/variables/commonHeaders 的草案、预览和应用结果。
- [ ] P0 | 状态：未开始 | agent invocation 展示目标 Agent、任务、pending/running/completed/interrupted 状态、输出和错误。
- [ ] P0 | 状态：未开始 | cancelled 与 error 使用独立样式；只有 retryable=true 且存在可重试 run 时展示重试入口。
- [ ] P0 | 状态：未开始 | 消息列表只在用户距离底部小于阈值时跟随流式内容；用户向上查看历史时不得强制滚到底部。
- [ ] P0 | 状态：未开始 | 用户消息、最终回答、工具卡片、审批卡片、间距、字号、圆角、边框、折叠图标和 composer 布局尽可能对齐参考面板。
- [ ] P0 | 状态：未开始 | UI 使用现有且真实存在的主题变量适配明暗主题，不使用行内样式，不直接复制参考项目的 React 图标和 CSS token。
- [ ] P0 | 状态：未开始 | Markdown 禁止执行任意 HTML、script、事件属性和危险 URL，代码块、表格、列表、链接和长内容可安全滚动。
- [ ] P0 | 状态：未开始 | 工具详情和 ChangeSet diff 设置高度与换行限制，不撑爆面板；JSON 展示稳定且敏感字段脱敏。
- [ ] P0 | 状态：未开始 | Agent 发送后输入框清空；working 时禁止并发发送；停止按钮仅在可停止状态展示。
- [ ] P0 | 状态：未开始 | 面板关闭再打开后事件顺序、折叠标识、审批结果、最终回答和当前 run 状态正确恢复。
- [ ] P1 | 状态：未开始 | 最后一条已完成用户消息支持编辑并重新运行；最终回答提供复制和可用时的重试操作。
- [ ] P1 | 状态：未开始 | 空状态、未配置、仅离线可用、模型错误和多语言错误提示与参考面板保持一致的视觉层级。
- [ ] P1 | 状态：未开始 | 所有新增 UI 文案通过 `t()`，同步更新中英文翻译并保证翻译符合上下文。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 使用测试 transport 为每一种事件、每一种 tool/run 终态和审批状态生成稳定 UI 断言。
- [ ] P0 | 状态：未开始 | 折叠、滚动跟随、历史查看、长内容、明暗主题、重开面板和 Markdown 安全测试通过。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 九、切换新链路与清理旧实现

- [ ] P0 | 状态：未开始 | 将 Agent 默认入口切换到 main 中 AI SDK 6 `ToolLoopAgent` 和新事件协议。
- [ ] P0 | 状态：未开始 | Ask 默认入口切换到 main 中 AI SDK 6 `streamText`，保留 Ask/Agent 独立会话。
- [ ] P0 | 状态：未开始 | 切换前通过最小验收集合，切换与旧逻辑删除在同一阶段完成，不留下长期功能开关。
- [ ] P0 | 状态：未开始 | 删除旧 `rawTools` 的 Agent 注册用法和所有字段级 Agent 工具注册。
- [ ] P0 | 状态：未开始 | 删除旧工具选择 LLM、手写 SSE tool call 合并、手写执行循环和旧 tool-call 消息展示依赖。
- [ ] P0 | 状态：未开始 | 检查旧工具文件是否被 MCP 或非 Agent 能力引用；保留必要业务实现，但通过独立适配器调用。
- [ ] P0 | 状态：未开始 | 新 Agent 工具列表只包含新高语义工具，MCP 注册不依赖 Agent 注册。
- [ ] P0 | 状态：未开始 | 对话缓存迁移后不再读取旧 Agent tool-call 结构。
- [ ] P1 | 状态：未开始 | 删除无引用旧类型、prompt、状态字段、i18n 和测试 fixture。

#### 阶段 Gate

- [ ] P0 | 状态：未开始 | 全仓搜索确认 Agent 不再引用旧 `rawTools`、字段级工具和手写循环。
- [ ] P0 | 状态：未开始 | Ask、Agent、MCP 和非 Agent 业务能力关键回归测试通过。
- [ ] P0 | 状态：未开始 | `npm run web:type-check` 通过。

### 十、测试分层与测试数据

- [ ] P0 | 状态：未开始 | 建立 `ai/test` 测试模型和可控 Agent transport，覆盖文本、reasoning、tool、approval、source、file、error、finish 和 abort。
- [ ] P0 | 状态：未开始 | Provider contract 测试覆盖非流式、SSE、tool arguments 分片、非法 JSON、未知工具、重复 toolCallId、半截流和空内容。
- [ ] P0 | 状态：未开始 | Provider contract 测试覆盖 401、403、404、429、余额不足、超时、5xx 和非流式错误响应，不依赖真实账户制造错误。
- [ ] P0 | 状态：未开始 | 状态机测试覆盖最大 step、重复只读调用、相同 ChangeSet、retryable、取消、online 切换和上下文丢失。
- [ ] P0 | 状态：未开始 | UI 事件测试通过测试 transport 注入事件，不直接调用 Pinia 业务方法制造最终状态。
- [ ] P0 | 状态：未开始 | 真实 DeepSeek smoke 仅覆盖 V4 Flash 普通文本、SSE、一次 tool call 和 V4 Pro 配置可用性。
- [ ] P0 | 状态：未开始 | live-api 测试通过显式环境开关运行；缺少 DEEPSEEK_API_KEY 时只跳过 live-api 项目并输出变量名。
- [ ] P0 | 状态：未开始 | 真实 API 测试限制调用次数和最大 token，失败不自动无限重试，不提交完整响应。
- [ ] P0 | 状态：未开始 | 为每个测试创建独立离线项目、节点、变量、ChangeSet 和对话，使用稳定测试前缀。
- [ ] P0 | 状态：未开始 | 测试结束清理项目、节点、变量、ChangeSet、对话缓存、Mock 日志、Mock 服务和 WebSocket 连接。
- [ ] P0 | 状态：未开始 | 清理逻辑只删除测试前缀和本轮生成 ID，不删除用户数据；失败后仍可重复执行清理。
- [ ] P1 | 状态：未开始 | 测试运行前保存 networkMode 和 AI 配置，结束后恢复原状态。
- [ ] P1 | 状态：未开始 | 增加 IndexedDB 污染和敏感缓存残留断言。
- [ ] P1 | 状态：未开始 | 测试名称表达用户场景和预期，关键操作添加必要注释，不创建无意义公共测试辅助函数。

#### 最小验收集合

- [ ] P0 | 状态：未开始 | Ask 流式回答、停止、错误和第二轮上下文通过。
- [ ] P0 | 状态：未开始 | Agent 无工具、单工具、多工具、多轮、最大步数和停止通过。
- [ ] P0 | 状态：未开始 | 创建项目、创建 HTTP、修改当前接口、删除与恢复、变量变更通过 ChangeSet 审批流程。
- [ ] P0 | 状态：未开始 | 在线模式和 Web 构建所有 AI 入口与执行层均被阻止。
- [ ] P0 | 状态：未开始 | 中文、英文、日文回复和生成内容跟随用户语言。
- [ ] P0 | 状态：未开始 | 所有面板事件和终态的 UI contract 测试通过。

### 十一、安全、脱敏与数据治理

- [ ] P0 | 状态：未开始 | 建立统一 redaction 层，对事件、UI、缓存、日志、错误、trace 和测试输出使用同一敏感字段规则。
- [ ] P0 | 状态：未开始 | Authorization、Cookie、Set-Cookie、apiKey、token、password、secret、key 和用户标记敏感变量默认脱敏。
- [ ] P0 | 状态：未开始 | 原始工具数据只在当前执行内存中短暂存在；写入事件缓存前转换为脱敏 displayData。
- [ ] P0 | 状态：未开始 | 给模型的 modelData 与给 UI/缓存的 displayData 分离，既不破坏执行又不泄露敏感值。
- [ ] P0 | 状态：未开始 | API Key 不进入普通日志、analytics、错误上报、Playwright trace、截图或对话缓存。
- [ ] P0 | 状态：未开始 | localStorage AI Key 不被本地备份静默导出；如允许导出必须显式确认并默认排除。
- [ ] P0 | 状态：未开始 | AI 错误分类保留可读信息和稳定 errorCode，同时删除 Key、Header 值、请求体敏感内容和内部堆栈。
- [ ] P0 | 状态：未开始 | Markdown 链接限制为允许协议并增加安全属性，禁止 HTML 注入和脚本执行。
- [ ] P1 | 状态：未开始 | 记录 localStorage 保存 AI Key 的风险、适用边界和后续迁移到系统安全存储的计划。
- [ ] P1 | 状态：未开始 | 对话缓存设置保留上限和清理入口，清理后验证不残留用户输入、审批 payload 和 ChangeSet 摘要。
- [ ] P1 | 状态：未开始 | 审批卡片、ChangeSet diff、工具输入输出和来源摘要增加脱敏测试。

### 十二、最终验证

- [ ] P0 | 状态：未开始 | 执行 `npm run web:type-check` 并确保无类型错误。
- [ ] P0 | 状态：未开始 | 检查新增代码没有 `console.log`、`$t(`、行内样式、`any`、`enum` 和不存在的 CSS 变量。
- [ ] P0 | 状态：未开始 | 执行 `npm --prefix packages/web run pretest:e2e`。
- [ ] P0 | 状态：未开始 | 执行 Agent/Ask/Provider/事件/UI/ChangeSet/审批关键确定性 Playwright 测试。
- [ ] P0 | 状态：未开始 | 在存在真实 Key 时执行 live-api smoke 测试并记录调用次数、目的和 token usage。
- [ ] P0 | 状态：未开始 | 执行 Electron 本地构建，确认 main/renderer bundle、preload 和 IPC 正常。
- [ ] P0 | 状态：未开始 | 验证在线模式、Web 构建、缺少 Key、切换模式、关闭窗口和应用退出的运行边界。
- [ ] P0 | 状态：未开始 | 验证现有 Qwen、Custom Provider、MCP、HTTP、Mock、WebSocket 和非 Agent 功能没有回归。
- [ ] P0 | 状态：未开始 | 检查 diff 未修改 `share.html`、`testData.ts`，未包含真实 Key、响应快照或调试日志。
- [ ] P0 | 状态：未开始 | 更新所有已完成 item 的状态和验证证据，确认没有 P0/P1 未完成或未解释阻塞项。
