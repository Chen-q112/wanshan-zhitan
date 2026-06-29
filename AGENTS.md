# 皖山智探——安徽山脉AI地质科普助手 - 需求拆解文档

## 产品概述

- **产品类型**: AI科普工具平台（Web应用）
- **场景类型**: <scene_type>prototype-app</scene_type>
- **目标用户**: 安徽省高校学生、地质科普爱好者、参加科普大赛的评委与观众、对安徽山脉文化感兴趣的公众
- **核心价值**: 以AI为核心驱动，提供智能问答、图像识别、知识图谱、内容生成、知识测验五大功能，实现安徽山脉地质科普的智能化与高效传播
- **界面语言**: 中文
- **主题偏好**: 科技蓝+山水绿+水墨灰（用户指定配色）
- **导航模式**: 路径导航
- **导航布局**: Sidebar（左侧导航栏+右侧主内容区，用户明确指定）

---

## 页面结构总览

> **说明**：此表为页面生成的唯一数据源，包含所有页面（一级+二级）

| 页面名称 | 文件名 | 路由 | 页面类型 | 入口来源 |
|---------|-------|------|---------|---------|
| AI智能问答 | `AiChatPage.tsx` | `/ai-chat` | 一级 | 导航 |
| 山峰图像识别 | `ImageRecognitionPage.tsx` | `/image-recognition` | 一级 | 导航 |
| 地质知识图谱 | `KnowledgeGraphPage.tsx` | `/knowledge-graph` | 一级 | 导航 |
| 科普内容生成 | `ContentGeneratorPage.tsx` | `/content-generator` | 一级 | 导航 |
| 智能知识测验 | `QuizPage.tsx` | `/quiz` | 一级 | 导航 |
| 测验结果报告 | `QuizResultPage.tsx` | `/quiz/result` | 二级 | 测验页 → 提交测验 |
| 错题本 | `WrongAnswerBookPage.tsx` | `/quiz/wrong-answers` | 二级 | 测验页 → 错题本入口 |
| 关于我们 | `AboutPage.tsx` | `/about` | 一级 | 导航 |

> **页面类型说明**：
> - **一级页面**：出现在左侧导航中，用户可直接访问
> - **二级页面**：不在导航中，从一级页面跳转进入

---

## 页面布局建议

- **布局模式**: 左侧Sidebar全局导航 + 右侧主内容区（用户明确指定）
- **视觉重心**: 各页面核心交互区（AI对话区/图谱画布/生成结果区/测验答题区）
- **结果承载区**: 
  - AI智能问答：对话消息流（初始态为空状态引导提示）
  - 图像识别：识别结果卡片+详细科普展开区（初始态为上传引导占位）
  - 知识图谱：交互式图谱画布+节点详情侧面板（初始态为默认地貌视图）
  - 科普内容生成：生成结果预览区+操作工具栏（初始态为空状态引导）
  - 智能知识测验：答题区+进度条+即时解析区（初始态为测验配置引导）

---

## 插件规划

| 插件实例名称 | 基于官方插件 | 业务用途 | 输出模式 | 所属页面 |
|------------|-----------|---------|---------|---------|
| 山脉知识问答 | `ai-text-generate` | 基于安徽山脉知识库，回答用户关于地质地貌、生态文化等自然语言问题 | stream | AI智能问答 |
| 山峰图像识别 | `ai-image-understanding` | 识别用户上传的山峰图片，判断山峰名称、地貌类型、海拔等地质特征 | stream | 山峰图像识别 |
| 科普短文生成 | `ai-text-generate` | 根据用户输入的主题关键词，生成300-500字专业科普短文 | stream | 科普内容生成 |
| 讲解词生成 | `ai-text-generate` | 根据用户输入的山峰名称，生成导游讲解词 | stream | 科普内容生成 |
| 研学方案生成 | `ai-text-generate` | 根据用户输入的天数和主题，生成科普研学方案 | stream | 科普内容生成 |
| 测验题目生成 | `ai-text-generate` | 根据用户指定的难度和数量，生成选择题/判断题/填空题 | stream | 智能知识测验 |
| 答题解析与拓展 | `ai-text-generate` | 对用户答错的题目给出详细解析和知识点拓展 | stream | 智能知识测验 |

---

## 导航配置

- **导航布局**: Sidebar（左侧固定导航栏）
- **导航项**（仅一级页面）:

| 导航文字 | 路由 | 图标(建议) |
|---------|------|-----------|
| 🤖 AI智能问答 | `/ai-chat` | MessageSquare |
| 📷 山峰图像识别 | `/image-recognition` | Image |
| 🕸️ 地质知识图谱 | `/knowledge-graph` | GitGraph |
| ✍️ 科普内容生成 | `/content-generator` | PenTool |
| 🎓 智能知识测验 | `/quiz` | GraduationCap |
| ℹ️ 关于我们 | `/about` | Info |

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 安徽山脉知识库（17座山+三大地貌） | demo-mock | `src/data/mountains.ts` 内置完整静态数据，作为所有AI插件的知识上下文注入 | ✅ 本身就是mock（知识库为静态数据） |
| AI智能问答 | real-plugin | 调 ai-text-generate 实例，传入用户问题+山脉知识库上下文，流式输出科普回答 | 无（插件能力不可 mock） |
| 山峰图像识别 | real-plugin | 调 ai-image-understanding 实例，传入用户上传的山峰图片，流式输出识别结果（山峰名称、地貌类型、海拔、地理位置、地质特征） | 无（插件能力不可 mock） |
| 科普内容生成（短文/讲解词/研学方案/测验题） | real-plugin | 调 ai-text-generate 实例，传入用户指定的模式+参数+知识库上下文，流式输出生成内容 | 无（插件能力不可 mock） |
| 测验题目生成 | real-plugin | 调 ai-text-generate 实例，传入难度+数量+题型要求+知识库上下文，流式输出题目JSON | 无（插件能力不可 mock） |
| 答题解析与知识点拓展 | real-plugin | 调 ai-text-generate 实例，传入错题信息+知识库上下文，流式输出解析 | 无（插件能力不可 mock） |
| 对话历史保存 | local-persist | localStorage key=`__wanshan_chat_history`，保存最近对话记录 | 无 |
| 测验成绩与错题本 | local-persist | localStorage key=`__wanshan_quiz_records`、`__wanshan_wrong_answers` | 无 |
| 排行榜数据 | local-persist | localStorage key=`__wanshan_leaderboard`，存储本地测验成绩排行 | 无 |
| 知识图谱数据 | demo-mock | `src/data/knowledge-graph.ts` 内置节点与边关系数据 | ✅ 本身就是mock |
| 生成内容导出 | import-export | Blob + a.click 触发文本下载（.txt/.md） | 无 |

---

## 功能列表

> **说明**：每个页面的功能点，供页面生成使用

- **页面**: AI智能问答（`/ai-chat`）
  - **页面目标**: 提供自然语言对话式科普问答，用户可自由提问安徽山脉相关问题并获得专业回答
  - **布局模式**: 上下分区——顶部标题栏+中部对话消息流+底部输入区
  - **视觉重心**: 对话消息流（类ChatGPT风格）
  - **结果承载区**: 对话消息列表；初始态为空状态引导（"👋 你好！我是皖山智探AI助手，你可以问我任何关于安徽山脉的问题..."）
  - **功能点**:
    - **对话输入与发送**: 底部固定输入框+发送按钮，支持Enter发送，Shift+Enter换行
    - **AI流式回答**: 调用AI插件流式输出回答，打字机动效逐字显示，显示"AI思考中..."状态指示器
    - **关键术语标注**: AI回答中自动高亮地质专业术语（如"花岗岩地貌""燕山期"），点击弹出Tooltip显示详细解释
    - **相关问题推荐**: 每条AI回答末尾自动生成3个相关问题推荐，点击直接发起新提问
    - **对话历史管理**: 左侧对话列表（可折叠），显示历史对话标题，支持切换、删除；数据持久化到localStorage
    - **新对话**: 顶部"新对话"按钮，清空当前对话，开始全新会话

- **页面**: 山峰图像识别（`/image-recognition`）
  - **页面目标**: 用户上传山峰图片，AI识别山峰并展示详细科普信息
  - **布局模式**: 左右分栏（桌面端）——左侧上传区+右侧识别结果区；移动端上下堆叠
  - **视觉重心**: 识别结果卡片（山峰名称+置信度+详细科普）
  - **结果承载区**: 识别结果卡片+详细科普展开区；初始态为上传引导占位（虚线框+图标+提示文字"点击上传或拖拽山峰图片"）
  - **源材料承载区**: 左侧上传区含已上传图片预览，识别过程中图片持续可见供对照
  - **功能点**:
    - **图片上传**: 支持点击上传、拖拽上传、移动端拍照，预览已选图片
    - **AI图像识别**: 调用图像识别插件，流式返回识别结果（山峰名称、地貌类型、海拔、地理位置、地质特征、相似度百分比）
    - **识别结果展示**: 结果卡片展示山峰名称（大字标题）、置信度进度条、地貌类型Badge、海拔、所在地区
    - **详细科普展开**: 识别成功后自动展开该山的详细科普介绍（从知识库匹配），含地质成因、特色景观、文化典故
    - **反馈纠正**: 识别结果下方提供"识别有误？"按钮，点击弹出反馈表单，用户可提交纠正信息
    - **识别历史**: 侧边栏显示最近识别记录（缩略图+山峰名称），点击可回溯查看

- **页面**: 地质知识图谱（`/knowledge-graph`）
  - **页面目标**: 以交互式知识图谱可视化展示安徽山脉之间的地质关系、地貌分类、生态系统、文化关联
  - **布局模式**: 主从布局——左侧视图切换+搜索栏，主区域为全屏交互式图谱画布，右侧为节点详情侧面板
  - **视觉重心**: 知识图谱画布（力导向图/树状图）
  - **结果承载区**: 节点详情侧面板；初始态为默认地貌视图，中心节点"安徽山脉"高亮
  - **功能点**:
    - **图谱交互**: 支持缩放（滚轮）、拖拽平移（鼠标拖拽）、节点点击展开详情
    - **视图切换**: 顶部Tab切换4种视图——地貌视图（按花岗岩/丹霞/火山分类）、山系视图（按黄山山脉/九华山山脉/大别山脉/江淮丘陵分类）、生态视图（森林生态/珍稀物种）、文化视图（诗词/宗教/历史典故）
    - **节点详情**: 点击任意节点，右侧滑出详情面板，展示该节点对应的山脉/地貌/文化信息卡片
    - **节点搜索定位**: 顶部搜索框输入山脉名称，自动定位并高亮对应节点，画布平滑移动到该节点
    - **关联连线**: 节点之间有彩色连线表示关联关系（如黄山→花岗岩地貌→天柱山），连线hover显示关系说明
    - **图例说明**: 左下角图例浮层，解释节点颜色和连线含义

- **页面**: 科普内容生成（`/content-generator`）
  - **页面目标**: 用户选择生成模式并输入参数，AI自动生成专业科普内容
  - **布局模式**: 左右分栏（桌面端）——左侧配置面板+右侧生成结果区；移动端上下堆叠
  - **视觉重心**: 生成结果预览区
  - **结果承载区**: 生成内容预览区+操作工具栏（复制/导出）；初始态为空状态引导（"选择生成模式，输入主题开始创作..."）
  - **功能点**:
    - **生成模式选择**: 顶部Tab切换4种模式——科普短文、讲解词、研学方案、问答题目，切换时下方配置项动态变化
    - **参数配置**: 根据模式显示对应配置项（主题输入框、山峰名称选择器、天数滑块、难度选择、数量输入、风格选择：专业/通俗/趣味）
    - **AI内容生成**: 点击"生成"按钮，调用AI文本生成插件，流式输出生成内容，显示生成进度动效
    - **结果预览与编辑**: 右侧实时显示生成内容，支持富文本渲染（标题、段落、列表）
    - **复制与导出**: 生成完成后显示"复制全文"按钮（navigator.clipboard）和"导出为文本"按钮（Blob下载.txt）
    - **参考来源**: 生成内容末尾自动附带参考来源标注（基于知识库数据）

- **页面**: 智能知识测验（`/quiz`）
  - **页面目标**: AI自适应出题，测试用户对安徽山脉知识的掌握程度
  - **布局模式**: 上下分区——顶部进度条+中部答题区+底部操作按钮
  - **视觉重心**: 答题区（题目+选项）
  - **结果承载区**: 即时解析区（答题后展开）；初始态为测验配置引导（选择难度+开始按钮）
  - **功能点**:
    - **测验配置**: 开始前显示难度选择（入门/进阶/专家）+题型选择（选择/判断/填空/图片识别）+题目数量设置，点击"开始测验"
    - **AI题目生成**: 调用AI插件根据配置生成题目，流式返回题目JSON，解析后渲染答题界面
    - **答题交互**: 选择题点击选项即提交，判断题点击对/错，填空题输入文本提交，图片识别题展示山峰图片+选择名称
    - **即时解析**: 每题提交后立即显示对错判断+AI生成的详细解析和知识点拓展（调用AI插件流式输出）
    - **自适应难度**: 答对连续3题自动升级难度，答错连续2题自动降低难度（前端逻辑判定+重新调用AI生成新难度题目）
    - **进度追踪**: 顶部进度条显示当前题号/总题数，正确/错误计数
    - **测验完成**: 全部答完后跳转至测验结果报告页

- **页面**: 测验结果报告（`/quiz/result`）
  - **页面目标**: 展示测验成绩、详细答题记录和学习建议
  - **布局模式**: 单栏信息流
  - **视觉重心**: 成绩环形图+得分大字
  - **功能点**:
    - **成绩概览**: 环形图展示正确率，大字显示得分（如"8/10"），评级（入门/进阶/专家）
    - **答题详情列表**: 每题显示题号、题目、用户答案、正确答案、对错标记，点击展开AI解析
    - **学习建议**: AI生成个性化学习建议（薄弱知识点+推荐学习方向）
    - **操作按钮**: "再来一局"（返回测验配置）、"查看错题本"（跳转错题本）、"分享成绩"（复制成绩卡片）
    - **排行榜更新**: 将本次成绩写入localStorage排行榜

- **页面**: 错题本（`/quiz/wrong-answers`）
  - **页面目标**: 收集和管理答错的题目，支持复习和重做
  - **布局模式**: 单栏列表
  - **功能点**:
    - **错题列表**: 按时间倒序展示所有错题，每题显示题目、正确答案、用户错误答案、所属知识点标签
    - **错题复习**: 点击错题展开AI详细解析，支持"重新作答"模式（仅展示该错题，重新提交）
    - **错题清除**: 支持单题删除和"清空全部"按钮
    - **错题统计**: 顶部显示错题总数、各知识点错题分布（简单柱状图）

- **页面**: 关于我们（`/about`）
  - **页面目标**: 介绍作品背景、团队信息、技术栈、大赛申报亮点
  - **布局模式**: 单栏信息流
  - **功能点**:
    - **作品介绍**: 作品名称、定位、核心价值、大赛主题呼应
    - **作品亮点**: 5大亮点卡片（科学性、普及性、原创性、专业性、地域性）
    - **技术架构**: 前端技术栈、AI能力、数据层说明
    - **团队信息**: 团队成员展示（姓名、角色、贡献）
    - **使用帮助**: 简要的用户引导和常见问题

---

## 数据共享配置

| 存储键名 | 数据说明 | 使用页面 |
|---------|---------|---------|
| `__global_wanshan_chat_history` | 对话历史记录列表，类型为 `IChatSession[]` | AI智能问答 |
| `__global_wanshan_quiz_records` | 测验成绩记录列表，类型为 `IQuizRecord[]` | 智能知识测验、测验结果报告 |
| `__global_wanshan_wrong_answers` | 错题本数据，类型为 `IWrongAnswer[]` | 智能知识测验、错题本 |
| `__global_wanshan_leaderboard` | 排行榜数据，类型为 `ILeaderboardEntry[]` | 测验结果报告 |
| `__global_wanshan_recognition_history` | 图像识别历史记录，类型为 `IRecognitionRecord[]` | 山峰图像识别 |

```ts
interface IChatSession {
  id: string;
  title: string;
  messages: IChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  relatedQuestions?: string[];
  highlightedTerms?: ITermHighlight[];
}

interface ITermHighlight {
  term: string;
  explanation: string;
  startIndex: number;
  endIndex: number;
}

interface IQuizRecord {
  id: string;
  date: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  score: number;
  answers: IAnswerRecord[];
  learningAdvice?: string;
}

interface IAnswerRecord {
  questionIndex: number;
  question: string;
  questionType: 'choice' | 'truefalse' | 'fillblank' | 'image';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  aiExplanation?: string;
  knowledgePoint?: string;
}

interface IWrongAnswer {
  id: string;
  quizRecordId: string;
  date: string;
  question: string;
  questionType: 'choice' | 'truefalse' | 'fillblank' | 'image';
  userAnswer: string;
  correctAnswer: string;
  aiExplanation?: string;
  knowledgePoint: string;
}

interface ILeaderboardEntry {
  date: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
}

interface IRecognitionRecord {
  id: string;
  imageUrl: string;
  mountainName: string;
  confidence: number;
  landformType: string;
  elevation: number;
  location: string;
  timestamp: string;
}

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 用户提供完整需求文档与视觉风格关键词，无成品截图或手绘稿，按产品语义自主建立 art direction。
- **核心情绪 / 应用类型**: 地质科普工具平台，需在"AI 科技理性"与"安徽山水人文"之间建立可信、沉静、有探索感的对话氛围。
- **独特记忆点**: 水墨晕染的"地质剖面"——界面装饰与空状态使用模拟岩石层理、水墨皴法的抽象纹理，将地质科学可视化转化为东方美学符号。

## 2. Art Direction

- **方向名**: 墨韵地质 · Digital Ink Geology
- **Design Style**: Editorial 经典排版 + Warm Natural 自然暖调 —— 以克制排版承载科普长文与数据，以水墨灰与岩层肌理传递地质学科的沉静与安徽山水的文化厚度。
- **DNA 参数**: 圆角 subtle（`rounded-md`）/ 阴影 subtle（`shadow-sm`，卡片轻抬升）/ 间距 spacious（`gap-6` `p-8`，给地质内容呼吸感）/ 字体方向 衬线标题 + 无衬线正文 / 装饰手法 水墨晕染纹理、岩层剖面线、矿物结晶点阵。
- **应用类型**: Tool —— 左侧导航 + 右侧内容区，对话、图谱、表单、测验多场景切换。

## 3. Color System

**色彩关系**: 墨灰基底 + 青蓝主色 + 松绿辅助，从安徽山水（徽墨、青灰岩壁、黄山松）中抽取，科技蓝降饱和融入东方色温。
**配色设计理由**: primary 青蓝用于主交互与品牌锚点，传递 AI 可靠感；accent 松绿用于图谱节点、成功反馈与生态内容标签；bg 暖灰白模拟宣纸底，card 微暖白抬升阅读层；text 深墨灰保证长文可读。
**主色推导**: 用户指定科技蓝 #1E88E5 与山水绿 #2E7D32，将其降饱和、调色温后融入墨灰基底：primary 取青蓝偏灰（hsl(207 60% 48%)），accent 取松绿偏暖（hsl(150 30% 35%)），避免高饱和科技蓝与水墨灰的冲突。
**使用比例**: 60% 中性（bg/card/border）/ 30% 辅助（accent 浅底、图谱色、标签）/ 10% primary（CTA、当前页、主状态）。

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(40 15% 96%) | 暖灰白宣纸底，微暖不刺眼 |
| card | `--card` | `bg-card` | hsl(40 20% 99%) | 卡片与对话气泡，轻抬于 bg |
| text | `--foreground` | `text-foreground` | hsl(220 12% 18%) | 深墨灰正文，对比度 ≥ 4.5:1 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(220 8% 45%) | 占位符、辅助说明、时间戳 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(207 60% 48%) | 青蓝主交互，CTA、导航激活态、链接 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(0 0% 98%) | primary 上的文字与图标 |
| accent | `--accent` | `bg-accent` | hsl(150 20% 92%) | hover/focus 浅底、选中态、Skeleton |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(150 30% 35%) | accent 上的文字，图谱节点标签、生态标签 |
| border | `--border` | `border-border` | hsl(220 10% 85%) | 输入框、卡片边界，弱于文本 |

**语义色提示**:
- 成功（答题正确、识别成功）：bg `hsl(150 25% 92%)` / border `hsl(150 30% 60%)` / text `hsl(150 35% 28%)`，饱和度与 accent 对齐。
- 警告（置信度低、测验提示）：bg `hsl(40 30% 93%)` / border `hsl(40 35% 65%)` / text `hsl(40 40% 30%)`，暖黄偏灰，不刺眼。
- 错误（识别失败、答题错误）：bg `hsl(8 25% 93%)` / border `hsl(8 30% 60%)` / text `hsl(8 35% 32%)`，低饱和红，与 primary 色温协调。
- 图谱节点色（地貌分类）：花岗岩 `hsl(207 40% 55%)` / 丹霞 `hsl(15 35% 50%)` / 火山 `hsl(25 40% 48%)`，均降饱和融入整体色板。

## 4. 字体与节奏

- **font-display**: Noto Serif SC —— 页面标题、模块名称、山峰名称，传递地质学科的经典感与安徽文化底蕴。
- **font-body**: Noto Sans SC —— 正文、对话、表单、图谱标签，保证长文清晰可读与界面一致性。
- **字号**: H1 text-5xl；H2 text-2xl ~ text-3xl；body text-base；muted text-sm。
- **圆角**: subtle（`rounded-md`）—— 卡片、按钮、输入框统一微圆角，保持专业感，避免过度柔和。

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导，左侧导航 + 右侧主内容区，对话、图谱、表单、测验四类内容区独立布局。
- **Page / Section Order**: AI智能问答 → 山峰图像识别 → 地质知识图谱 → 科普内容生成 → 智能知识测验 → 关于页面，与需求文档模块顺序一致。
- **Standard Content Zone**: 后台工具型 `max-w-6xl`（约 1152px）`mx-auto`，适配对话长文本、图谱全屏与测验表单。
- **Shell / Frame Alignment**: 内容容器与左侧导航独立滚动，内容区采用安全区独立网格，导航固定宽度 240px。
- **Padding & Rhythm**: `px-6 lg:px-8 py-8`，卡片内 `p-6`，对话气泡间距 `gap-4`，保持 8px 倍数节奏。
- **Full-bleed Zones**: 知识图谱画布可全宽 `w-full`，内部工具栏与搜索仍受 Standard Content Zone 约束；Hero 区域（关于页面）背景图可全宽，文字居中受内容区约束。
- **Local Narrowing**: 科普内容生成表单、测验答题区在统一容器内收窄至 `max-w-2xl`，优化阅读行长。
- **Overflow Strategy**: 知识图谱画布使用 `overflow-hidden` 配合缩放拖拽；宽数据表使用 `overflow-x-auto`。
- **Flexibility Boundary**: 允许移动端 padding 缩至 `px-4`、卡片内边距 `p-4`；全局 max-w、圆角系统、主色与阴影语言保持一致。

## 6. 视觉与动效

- **装饰**: 水墨晕染纹理（空状态、卡片头图、关于页背景）、岩层剖面线（分隔线、图谱边线）、矿物结晶点阵（loading 动效、数据点标记）。
- **阴影/边界**: 轻（`shadow-sm`）—— 卡片微抬升，对话气泡用浅色边界替代阴影，保持水墨轻透感。
- **动效**: 精致 —— AI 思考时打字机逐字浮现 + 水墨晕染扩散指示器；页面切换 fade + 微上移（`opacity + translateY 4px`）；图谱节点 hover 放大 1.05x + 连线高亮；测验答题正确绿色脉冲、错误轻摇。

## 7. 组件原则

- 按钮、表单、菜单、卡片必须有 Default / Hover / Active / Focus / Disabled 状态。
- Primary 按钮（`bg-primary text-primary-foreground`）承担主行动：发送问题、开始识别、生成内容、提交答案。
- Secondary/Outline 使用 `border-border` + `bg-card`，hover 时切换为 `bg-accent`。
- Ghost 按钮与菜单项 hover/focus/selected 使用 `bg-accent text-accentForeground`。
- 对话气泡：用户消息 `bg-primary text-primary-foreground` 右对齐，AI 回复 `bg-card border-border` 左对齐，关键术语内联标注使用 `text-accentForeground` 下划虚线。
- 加载与空状态：使用水墨晕染纹理 + 矿物结晶点阵动画，延续 Digital Ink Geology 视觉语言。

## 8. Image Direction

- **Image Role**: 关于页 Hero 背景图、模块空状态插画、山峰识别结果卡片头图、知识图谱节点缩略图。
- **Image Art Direction**: 水墨风格安徽山水摄影融合数字地质剖面——前景为黄山奇松或天柱山花岗岩峰林实景，中景叠加半透明岩层剖面线稿与矿物结晶点阵，远景水墨晕染山峦，整体色调控制在青灰与暖灰之间，光线为晨雾漫射，材质兼具宣纸纹理与地质图件质感。
- **Image Prompt Keywords**: Chinese ink wash mountain landscape, Anhui Huangshan granite peaks, geological cross-section overlay, mineral crystal lattice pattern, misty morning light, warm grey and slate blue palette, rice paper texture, digital scientific illustration fusion, ethereal atmosphere, high detail linework.
- **Image Avoidance**: 避免通用科技感蓝色渐变背景、商务人物素材图、无主题抽象几何图形、高饱和日落色调、AI 生成常见"仙境"过度渲染。

## 9. Anti-patterns

- **Split personality**: 知识图谱页突然切换深色背景或高饱和节点色；全站统一墨灰基底与青蓝主色。
- **Phantom tokens**: 编造 `--chart-1` 等未定义变量；图谱节点色使用语义色提示中已定义的 HSL。
- **Default SaaS drift**: 对话界面回退到通用 ChatGPT 白色气泡 + 蓝色链接；使用本产品的墨韵纹理气泡与青蓝主色。
- **Invisible interaction**: 图谱节点只靠颜色区分地貌类型，缺少 focus-visible 环与文字标签；每个交互节点必须有键盘可达状态。
- **Mono-hue tyranny**: primary 青蓝同时用于导航激活、按钮、链接、图标、图表；按 60-30-10 将 primary 收回至 CTA 与品牌锚点，accent 松绿承接图谱与生态标签。
- **Status color drift**: 成功绿饱和度远高于 accent 松绿，形成刺眼跳变；语义色饱和度与 accent（约 30%）对齐，±15% 内浮动。