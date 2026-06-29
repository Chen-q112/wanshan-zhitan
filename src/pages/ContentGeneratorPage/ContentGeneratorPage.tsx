import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Image } from '@/components/ui/image';
import {
  PenTool,
  Copy,
  Download,
  Sparkles,
  FileText,
  Map,
  GraduationCap,
  HelpCircle,
  Loader2,
  Check,
  Mountain,
  Clock,
  BookOpen,
} from 'lucide-react';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { callAgnesStream } from '@/lib/agnes-api';

// ─── 生成模式定义 ───────────────────────────────────────────────
type GenerateMode = 'article' | 'guide' | 'tour' | 'quiz';

interface ModeConfig {
  key: GenerateMode;
  label: string;
  icon: typeof PenTool;
  description: string;
  placeholder: string;
  pluginInstanceId: string;
  actionKey: string;
}

const MODES: ModeConfig[] = [
  {
    key: 'article',
    label: '科普短文',
    icon: FileText,
    description: '输入主题关键词，生成300-500字专业科普文章',
    placeholder: '例如：黄山花岗岩地貌的形成过程',
    pluginInstanceId: 'popular_science_article_generate_1',
    actionKey: 'textGenerate',
  },
  {
    key: 'guide',
    label: '讲解词',
    icon: Map,
    description: '输入山峰名称，生成导游讲解词',
    placeholder: '例如：天柱山',
    pluginInstanceId: 'guide_speech_generation_1',
    actionKey: 'textGenerate',
  },
  {
    key: 'tour',
    label: '研学方案',
    icon: Mountain,
    description: '输入天数和主题，生成科普研学方案',
    placeholder: '例如：2天黄山地质研学',
    pluginInstanceId: 'study_tour_plan_generator_1',
    actionKey: 'textGenerate',
  },
  {
    key: 'quiz',
    label: '问答题目',
    icon: HelpCircle,
    description: '输入难度和数量，生成测验题目',
    placeholder: '例如：中等难度，10道选择题',
    pluginInstanceId: 'quiz_question_generator_1',
    actionKey: 'textGenerate',
  },
];

const STYLE_OPTIONS = [
  { value: 'professional', label: '专业' },
  { value: 'popular', label: '通俗' },
  { value: 'fun', label: '趣味' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'expert', label: '专家' },
];

const CONTENT_GEN_BG = '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihtha34ao_ve_miaoda';

// ─── 组件 ────────────────────────────────────────────────────────
export default function ContentGeneratorPage() {
  const [activeMode, setActiveMode] = useState<GenerateMode>('article');
  const [inputValue, setInputValue] = useState('');
  const [style, setStyle] = useState('popular');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [days, setDays] = useState([2]);
  const [questionCount, setQuestionCount] = useState([10]);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const currentMode = MODES.find((m) => m.key === activeMode)!;

  // ─── 构建 AGNES Prompt ──────────────────────────────────────
  const buildPrompt = useCallback(() => {
    const styleLabel = style === 'professional' ? '专业学术风格' : style === 'popular' ? '通俗易懂的科普风格' : '趣味生动风格';
    const difficultyLabel = difficulty === 'beginner' ? '入门级' : difficulty === 'intermediate' ? '进阶级' : '专家级';

    switch (activeMode) {
      case 'article':
        return `请以${styleLabel}，针对"${inputValue}"这个主题，撰写一篇300-500字的专业科普短文，介绍安徽山脉相关的地质地貌知识。`;
      case 'guide':
        return `请为"${inputValue}"这座山峰生成一篇导游讲解词，${styleLabel}，内容包括山峰概况、地质成因、特色景观、文化典故等，适合向游客讲解。`;
      case 'tour':
        return `请根据主题"${inputValue}"，设计一份${days[0]}天的安徽山脉科普研学方案。方案应包括每日行程安排、地质观察点、科普活动、安全注意事项等内容。`;
      case 'quiz':
        return `请生成${questionCount[0]}道关于安徽山脉地质知识的测验题目，难度为${difficultyLabel}，包含选择题、判断题和填空题。请以清晰的格式输出，每题包含题目、选项（选择题）、正确答案和简要解析。`;
      default:
        return inputValue;
    }
  }, [activeMode, inputValue, style, difficulty, days, questionCount]);

  // ─── 流式生成 ─────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!inputValue.trim()) {
      toast.error('请输入内容主题');
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);
    setGeneratedContent('');
    setHasGenerated(false);

    try {
      const prompt = buildPrompt();
      const stream = callAgnesStream(prompt);

      let full = '';
      for await (const chunk of stream) {
        if (controller.signal.aborted) break;
        full += chunk;
        setGeneratedContent(full);
      }
      setHasGenerated(true);
      toast.success('内容生成完成');
    } catch (err: unknown) {
      if ((err as Error).name === 'AbortError') return;
      logger.error('Content generation failed:', String(err));
      toast.error('生成失败，请重试');
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [inputValue, buildPrompt]);

  // ─── 停止生成 ─────────────────────────────────────────────────
  const handleStop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ─── 复制全文 ─────────────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      toast.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('复制失败');
    }
  }, [generatedContent]);

  // ─── 导出文本 ─────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const blob = new Blob([generatedContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `皖山智探_${currentMode.label}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('导出成功');
  }, [generatedContent, currentMode]);

  // ─── 模式切换时重置 ──────────────────────────────────────────
  const handleModeChange = useCallback((value: string) => {
    setActiveMode(value as GenerateMode);
    setInputValue('');
    setGeneratedContent('');
    setHasGenerated(false);
  }, []);

  return (
    <div className="space-y-6">
      {/* ── 页面标题 ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold tracking-tight">科普内容生成</h1>
        <p className="text-muted-foreground mt-1">
          AI 智能生成专业科普内容，支持多种模式与风格
        </p>
      </motion.div>

      {/* ── 生成模式 Tabs ── */}
      <Tabs value={activeMode} onValueChange={handleModeChange}>
        <TabsList className="grid w-full grid-cols-4 h-auto p-1">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            return (
              <TabsTrigger
                key={mode.key}
                value={mode.key}
                className="flex-col items-center justify-center gap-1 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                <Icon className="size-5" />
                <span className="text-xs font-medium">{mode.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {MODES.map((mode) => (
          <TabsContent key={mode.key} value={mode.key} className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* ── 左侧配置面板 ── */}
              <motion.div
                className="lg:col-span-2"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35 }}
              >
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <mode.icon className="size-5 text-primary" />
                      {mode.label}配置
                    </CardTitle>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {/* 主题输入 */}
                    <div className="space-y-2">
                      <Label htmlFor="topic-input">
                        {mode.key === 'guide' ? '山峰名称' : mode.key === 'tour' ? '研学主题' : '内容主题'}
                      </Label>
                      <Textarea
                        id="topic-input"
                        placeholder={mode.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    {/* 风格选择（短文/讲解词模式） */}
                    {(mode.key === 'article' || mode.key === 'guide') && (
                      <div className="space-y-2">
                        <Label>写作风格</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STYLE_OPTIONS.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* 天数滑块（研学方案模式） */}
                    {mode.key === 'tour' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>研学天数</Label>
                          <Badge variant="secondary" className="tabular-nums">
                            {days[0]} 天
                          </Badge>
                        </div>
                        <Slider
                          value={days}
                          onValueChange={setDays}
                          min={1}
                          max={7}
                          step={1}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1天</span>
                          <span>7天</span>
                        </div>
                      </div>
                    )}

                    {/* 难度+数量（问答题目模式） */}
                    {mode.key === 'quiz' && (
                      <>
                        <div className="space-y-2">
                          <Label>难度级别</Label>
                          <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTY_OPTIONS.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>题目数量</Label>
                            <Badge variant="secondary" className="tabular-nums">
                              {questionCount[0]} 道
                            </Badge>
                          </div>
                          <Slider
                            value={questionCount}
                            onValueChange={setQuestionCount}
                            min={5}
                            max={30}
                            step={5}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>5道</span>
                            <span>30道</span>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 生成/停止按钮 */}
                    <div className="flex gap-2 pt-2">
                      {isGenerating ? (
                        <Button
                          variant="destructive"
                          onClick={handleStop}
                          className="flex-1"
                        >
                          <Loader2 className="size-4 mr-2 animate-spin" />
                          停止生成
                        </Button>
                      ) : (
                        <Button
                          onClick={handleGenerate}
                          className="flex-1"
                          disabled={!inputValue.trim()}
                        >
                          <Sparkles className="size-4 mr-2" />
                          开始生成
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* ── 右侧生成结果区 ── */}
              <motion.div
                className="lg:col-span-3"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                <Card className="min-h-[500px] flex flex-col">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="size-5 text-primary" />
                        生成结果
                      </CardTitle>
                      {hasGenerated && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCopy}
                            className="h-8"
                          >
                            {copied ? (
                              <Check className="size-4 text-success" />
                            ) : (
                              <Copy className="size-4" />
                            )}
                            <span className="ml-1.5 text-xs">{copied ? '已复制' : '复制'}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleExport}
                            className="h-8"
                          >
                            <Download className="size-4" />
                            <span className="ml-1.5 text-xs">导出</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col min-h-0">
                    {/* 空状态 */}
                    {!hasGenerated && !isGenerating && (
                      <div className="flex-1 flex flex-col items-center justify-center text-center py-16 relative overflow-hidden">
                        <div className="absolute inset-0 ink-texture-bg opacity-30" />
                        <div className="absolute bottom-0 left-0 right-0 h-32 mountain-silhouette opacity-20" />
                        <div className="absolute top-1/4 right-10 w-24 h-24 ink-wash rounded-full opacity-30 blur-xl" />
                        
                        <div className="relative z-10 flex flex-col items-center">
                          <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center mb-8 shadow-md backdrop-blur-sm border border-primary/10">
                            <div className="size-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                              <PenTool className="size-7 text-primary" />
                            </div>
                          </div>
                          <p className="text-lg text-foreground font-medium mb-2">选择生成模式，输入主题开始创作</p>
                          <p className="text-sm text-muted-foreground">
                            AI 将根据你的配置生成专业科普内容
                          </p>
                        </div>
                      </div>
                    )}

                    {/* 生成中骨架 */}
                    {isGenerating && !generatedContent && (
                      <div className="flex-1 space-y-3 py-4">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <div className="flex items-center gap-2 pt-4">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">AI 正在生成内容...</span>
                        </div>
                      </div>
                    )}

                    {/* 流式内容 */}
                    <AnimatePresence mode="wait">
                      {(generatedContent || (isGenerating && generatedContent)) && (
                        <motion.div
                          key="content"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex-1 min-h-0"
                        >
                          <ScrollArea className="h-[420px] pr-2">
                            <div className="prose prose-sm max-w-none text-foreground whitespace-pre-line leading-relaxed">
                              {generatedContent}
                              {isGenerating && (
                                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom rounded-sm" />
                              )}
                            </div>
                          </ScrollArea>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* 参考来源 */}
                    {hasGenerated && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="flex-shrink-0 mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Clock className="size-3" />
                        <span>参考来源：安徽山脉知识库 · 生成时间 {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
