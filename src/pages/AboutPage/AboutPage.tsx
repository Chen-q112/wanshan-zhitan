import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Lightbulb,
  Users,
  Globe,
  Sparkles,
  MapPin,
  Cpu,
  Brain,
  Eye,
  PenTool,
  GraduationCap,
  MessageSquare,
  ImageIcon,
  GitGraph,
  Layers,
  Database,
  Palette,
  Monitor,
  Smartphone,
} from 'lucide-react';

const HERO_BG = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Anhui%20Huangshan%20granite%20peaks%2C%20geological%20cross-section%20overlay%2C%20mineral%20crystal%20lattice%20pattern%2C%20misty%20morning%20light%2C%20warm%20grey%20and%20slate%20blue%20palette%2C%20rice%20paper%20texture%2C%20digital%20scientific%20illustration%20fusion%2C%20ethereal%20atmosphere%2C%20high%20detail%20linework&image_size=landscape_16_9';

const HIGHLIGHTS = [
  {
    icon: Lightbulb,
    title: '科学性',
    description: '基于真实地质知识与权威文献，内容经过专业校验，确保每一条科普信息准确可靠。',
    color: 'text-chart-1',
  },
  {
    icon: Users,
    title: '普及性',
    description: 'AI 智能问答降低学习门槛，自然语言交互让零基础用户也能轻松探索安徽山脉奥秘。',
    color: 'text-chart-2',
  },
  {
    icon: Sparkles,
    title: '原创性',
    description: '安徽山脉主题 + AI 多功能工具平台，差异化定位填补地质科普数字化空白。',
    color: 'text-chart-3',
  },
  {
    icon: Cpu,
    title: '专业性',
    description: '融合 NLP 自然语言处理、CV 计算机视觉、知识图谱等多种 AI 技术，打造专业科普体验。',
    color: 'text-chart-4',
  },
  {
    icon: MapPin,
    title: '地域性',
    description: '紧扣安徽本土 17 座名山资源，呼应"科创兴皖"大赛主题，彰显地域文化自信。',
    color: 'text-chart-5',
  },
];

const TECH_STACK = [
  { category: '前端框架', items: ['React 19', 'TypeScript', 'Vite 8', 'Tailwind CSS 4'] },
  { category: 'UI 组件', items: ['shadcn/ui', 'Radix UI', 'Framer Motion', 'Lucide Icons'] },
  { category: 'AI 能力', items: ['大语言模型 (NLP)', '计算机视觉 (CV)', '知识图谱', '自适应学习算法'] },
  { category: '数据层', items: ['内置山脉知识库', 'localStorage 持久化', '流式响应处理'] },
  { category: '工程化', items: ['ESLint', 'react-router-dom 7', 'ECharts', '响应式设计'] },
];

const TEAM_MEMBERS = [
  { name: '团队成员', role: '项目负责人', contribution: '整体架构设计、AI 能力集成、知识库构建' },
  { name: '团队成员', role: '前端开发', contribution: 'UI 界面开发、交互动效、响应式适配' },
  { name: '团队成员', role: '算法工程师', contribution: 'NLP 模型调优、图像识别算法、知识图谱构建' },
  { name: '团队成员', role: '内容策划', contribution: '科普内容编写、山脉资料整理、题库设计' },
];

const FAQ_ITEMS = [
  {
    q: '如何使用 AI 智能问答？',
    a: '在左侧导航点击"AI 智能问答"，在底部输入框中用自然语言输入您关于安徽山脉的任何问题，按 Enter 发送。AI 会流式输出专业科普回答，您可以追问或点击推荐问题继续探索。',
  },
  {
    q: '山峰图像识别支持哪些山？',
    a: '目前支持识别安徽省内 17 座名山，包括黄山、九华山、天柱山、齐云山、大别山白马尖、牯牛降、敬亭山、琅琊山、浮山、大蜀山、女山、天堂寨、小孤山、皇藏峪、八公山、齐山、万佛山。',
  },
  {
    q: '知识图谱如何操作？',
    a: '使用鼠标滚轮缩放画布，拖拽平移视图，点击任意节点查看详细信息。顶部可切换地貌/山系/生态/文化四种视图，搜索框可快速定位特定山脉节点。',
  },
  {
    q: '测验成绩会保存吗？',
    a: '是的，您的测验成绩、错题本和排行榜数据都会保存在浏览器本地存储中。清除浏览器数据会导致记录丢失，建议定期截图保存重要成绩。',
  },
  {
    q: '生成的内容可以导出吗？',
    a: '科普短文、讲解词、研学方案等 AI 生成内容均支持一键复制到剪贴板，也可导出为 .txt 文本文件保存到本地。',
  },
];

const MODULES = [
  { icon: MessageSquare, name: 'AI 智能问答', desc: '自然语言对话式科普问答，多轮深入探讨' },
  { icon: ImageIcon, name: '山峰图像识别', desc: '上传山峰图片，AI 自动识别并展示详细科普' },
  { icon: GitGraph, name: '地质知识图谱', desc: '交互式可视化图谱，探索山脉地质关系' },
  { icon: PenTool, name: '科普内容生成', desc: 'AI 自动生成科普短文、讲解词、研学方案' },
  { icon: GraduationCap, name: '智能知识测验', desc: '自适应难度出题，即时解析与错题复习' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function AboutPage() {
  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-xl">
        <div className="absolute inset-0">
          <Image
            src={HERO_BG}
            alt="安徽山水水墨背景"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/40" />
        </div>
        <div className="relative px-6 py-12 md:px-10 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Badge variant="secondary" className="mb-4">
              第十七届安徽省百所高校百万大学生科普创意创新大赛
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              皖山智探
            </h1>
            <p className="mt-2 text-lg text-muted-foreground md:text-xl">
              安徽山脉 AI 地质科普助手
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
              以人工智能为核心驱动的多功能地质科普工具平台，融合自然语言处理、计算机视觉、
              知识图谱等前沿 AI 技术，让安徽山脉地质知识触手可及。呼应"科创兴皖，科普育人"
              大赛主题，用科技力量传播江淮大地的山川之美与地质之奇。
            </p>
          </motion.div>
        </div>
      </section>

      {/* 五大功能模块概览 */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold">核心功能</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            五大 AI 驱动模块，覆盖科普学习全场景
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <motion.div key={mod.name} variants={itemVariants}>
                <Card className="h-full border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="size-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{mod.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {mod.desc}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 作品亮点 */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className="mb-6">
          <h2 className="text-xl font-semibold">作品亮点</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            五大维度诠释作品的竞赛竞争力
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon;
            return (
              <motion.div key={h.title} variants={itemVariants}>
                <Card className="h-full border-border/60 transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                      <Icon className={`size-6 ${h.color}`} />
                    </div>
                    <p className="text-sm font-semibold">{h.title}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.section>

      {/* 技术架构 */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="size-5 text-primary" />
              技术架构
            </CardTitle>
            <CardDescription>
              前端技术栈、AI 能力与数据层一览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TECH_STACK.map((stack) => (
                <div key={stack.category} className="space-y-2">
                  <p className="text-sm font-semibold">{stack.category}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {stack.items.map((item) => (
                      <Badge key={item} variant="secondary" className="text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-6" />
            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Monitor className="size-3.5" /> PC 端适配
              </span>
              <span className="flex items-center gap-1.5">
                <Smartphone className="size-3.5" /> 移动端响应式
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="size-3.5" /> 主流浏览器兼容
              </span>
              <span className="flex items-center gap-1.5">
                <Palette className="size-3.5" /> 科技蓝 + 山水绿 + 水墨灰
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* 团队信息 */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-primary" />
              团队信息
            </CardTitle>
            <CardDescription>
              一群热爱安徽山水与 AI 技术的青年学子
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {TEAM_MEMBERS.map((member) => (
                <div
                  key={member.role}
                  className="flex flex-col items-center gap-3 rounded-lg border border-border/60 p-5 text-center transition-shadow hover:shadow-sm"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Users className="size-7 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{member.name}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {member.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {member.contribution}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* 使用帮助 */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="size-5 text-primary" />
              使用帮助
            </CardTitle>
            <CardDescription>
              快速上手，开启安徽山脉探索之旅
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((faq, i) => (
                <AccordionItem key={i} value={`faq-${i}`}>
                  <AccordionTrigger className="text-sm font-medium hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </motion.section>

      {/* 底部声明 */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center text-xs text-muted-foreground pb-4"
      >
        <p>皖山智探 · 安徽山脉 AI 地质科普助手</p>
        <p className="mt-1">
          第十七届安徽省百所高校百万大学生科普创意创新大赛 · 数字科普作品（AI 科普工具开发作品）
        </p>
        <p className="mt-1">科创兴皖 · 科普育人</p>
      </motion.div>
    </div>
  );
}
