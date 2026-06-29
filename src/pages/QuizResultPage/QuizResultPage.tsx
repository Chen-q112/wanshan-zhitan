import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  RotateCcw,
  BookOpen,
  Share2,
  Trophy,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Lightbulb,
  Target,
  Brain,
} from 'lucide-react';
import { scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { toast } from 'sonner';

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

interface ILeaderboardEntry {
  date: string;
  score: number;
  totalQuestions: number;
  difficulty: string;
}

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: '入门级',
  intermediate: '进阶级',
  expert: '专家级',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-blue-100 text-blue-700',
  expert: 'bg-orange-100 text-orange-700',
};

const TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  truefalse: '判断题',
  fillblank: '填空题',
  image: '图片识别题',
};

function getRating(correctCount: number, total: number): { label: string; stars: number } {
  const rate = correctCount / total;
  if (rate >= 0.9) return { label: '地质大师', stars: 5 };
  if (rate >= 0.7) return { label: '山脉达人', stars: 4 };
  if (rate >= 0.5) return { label: '科普新秀', stars: 3 };
  if (rate >= 0.3) return { label: '入门探索者', stars: 2 };
  return { label: '萌新起步', stars: 1 };
}

export default function QuizResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [record, setRecord] = useState<IQuizRecord | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<ILeaderboardEntry[]>([]);

  useEffect(() => {
    const stateRecord = (location.state as { record?: IQuizRecord })?.record;
    if (stateRecord) {
      setRecord(stateRecord);
      updateLeaderboard(stateRecord);
    } else {
      const stored = scopedStorage.getItem('__global_wanshan_quiz_records');
      if (stored) {
        try {
          const records: IQuizRecord[] = JSON.parse(stored);
          if (records.length > 0) {
            const latest = records[records.length - 1];
            setRecord(latest);
            updateLeaderboard(latest);
          }
        } catch {
          toast.error('读取测验记录失败');
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const stored = scopedStorage.getItem('__global_wanshan_leaderboard');
    if (stored) {
      try {
        const entries: ILeaderboardEntry[] = JSON.parse(stored);
        setLeaderboard(entries.slice(0, 10));
      } catch { /* ignore */ }
    }
  }, []);

  const updateLeaderboard = (rec: IQuizRecord) => {
    const entry: ILeaderboardEntry = {
      date: rec.date,
      score: rec.score,
      totalQuestions: rec.totalQuestions,
      difficulty: rec.difficulty,
    };
    const stored = scopedStorage.getItem('__global_wanshan_leaderboard');
    let entries: ILeaderboardEntry[] = [];
    if (stored) {
      try { entries = JSON.parse(stored); } catch { /* ignore */ }
    }
    entries.push(entry);
    entries.sort((a, b) => b.score - a.score);
    const trimmed = entries.slice(0, 20);
    scopedStorage.setItem('__global_wanshan_leaderboard', JSON.stringify(trimmed));
    setLeaderboard(trimmed.slice(0, 10));
  };

  const rating = useMemo(() => {
    if (!record) return { label: '', stars: 0 };
    return getRating(record.correctCount, record.totalQuestions);
  }, [record]);

  const pieOption: EChartsOption = useMemo(() => {
    if (!record) return {};
    return {
      tooltip: { trigger: 'item' },
      legend: { bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['60%', '82%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: false,
          label: { show: false },
          emphasis: { label: { show: false } },
          itemStyle: { borderRadius: 4, borderColor: 'transparent', borderWidth: 2 },
          data: [
            { value: record.correctCount, name: '正确', itemStyle: { color: '#2E7D32' } },
            { value: record.wrongCount, name: '错误', itemStyle: { color: '#c62828' } },
          ],
        },
      ],
    };
  }, [record]);

  const knowledgeChartOption: EChartsOption = useMemo(() => {
    if (!record) return {};
    const kpMap: Record<string, number> = {};
    record.answers.forEach((a) => {
      if (!a.isCorrect && a.knowledgePoint) {
        kpMap[a.knowledgePoint] = (kpMap[a.knowledgePoint] || 0) + 1;
      }
    });
    const data = Object.entries(kpMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
      xAxis: { type: 'value', minInterval: 1 },
      yAxis: { type: 'category', data: data.map((d) => d.name), axisLabel: { fontSize: 11 } },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          itemStyle: {
            color: '#1E88E5',
            borderRadius: [0, 4, 4, 0],
          },
          barMaxWidth: 28,
        },
      ],
    };
  }, [record]);

  const handleShare = () => {
    if (!record) return;
    const text = `🏔️ 皖山智探 · 知识测验成绩\n📊 得分：${record.score} 分（${record.correctCount}/${record.totalQuestions}）\n🎯 难度：${DIFFICULTY_LABELS[record.difficulty]}\n⭐ 评级：${rating.label}\n📅 日期：${record.date}\n\n—— 科创兴皖，科普育人 ——`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('成绩卡片已复制到剪贴板');
    }).catch(() => {
      toast.error('复制失败，请手动复制');
    });
  };

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Trophy className="size-16 text-muted-foreground/40" />
        <p className="text-muted-foreground">暂无测验记录</p>
        <Button onClick={() => navigate('/quiz')} variant="outline">
          <ArrowLeft className="size-4 mr-2" />
          返回测验
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 顶部返回 */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate('/quiz')}>
          <ArrowLeft className="size-4 mr-1" />
          返回测验
        </Button>
      </div>

      {/* 成绩概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-3">
              {/* 环形图 */}
              <div className="flex items-center justify-center p-6 lg:p-8">
                <div className="relative w-[220px] h-[220px]">
                  <ReactECharts
                    option={pieOption}
                    theme="ud"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black tabular-nums text-foreground">
                      {record.score}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5">分</span>
                  </div>
                </div>
              </div>

              {/* 成绩详情 */}
              <div className="flex flex-col justify-center p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-border">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="size-5 text-yellow-500" />
                  <span className="text-xl font-bold">{rating.label}</span>
                  <span className="text-yellow-500 text-sm">
                    {'★'.repeat(rating.stars)}{'☆'.repeat(5 - rating.stars)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between max-w-[260px]">
                    <span className="text-muted-foreground">难度</span>
                    <Badge variant="outline" className={DIFFICULTY_COLORS[record.difficulty]}>
                      {DIFFICULTY_LABELS[record.difficulty]}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between max-w-[260px]">
                    <span className="text-muted-foreground">总题数</span>
                    <span className="font-semibold tabular-nums">{record.totalQuestions}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-[260px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-green-600" />正确
                    </span>
                    <span className="font-semibold tabular-nums text-green-700">{record.correctCount}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-[260px]">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <XCircle className="size-3.5 text-red-500" />错误
                    </span>
                    <span className="font-semibold tabular-nums text-red-600">{record.wrongCount}</span>
                  </div>
                  <div className="flex items-center justify-between max-w-[260px]">
                    <span className="text-muted-foreground">正确率</span>
                    <span className="font-semibold tabular-nums">
                      {Math.round((record.correctCount / record.totalQuestions) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* 日期与操作 */}
              <div className="flex flex-col justify-center items-center p-6 lg:p-8 border-t lg:border-t-0 lg:border-l border-border gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">测验日期</p>
                  <p className="text-sm font-medium mt-0.5">{record.date}</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-[180px]">
                  <Button size="sm" onClick={() => navigate('/quiz')} className="w-full">
                    <RotateCcw className="size-4 mr-1.5" />
                    再来一局
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => navigate('/quiz/wrong-answers')} className="w-full">
                    <BookOpen className="size-4 mr-1.5" />
                    查看错题本
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleShare} className="w-full">
                    <Share2 className="size-4 mr-1.5" />
                    分享成绩
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* 学习建议 */}
      {record.learningAdvice && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="size-5 text-blue-500" />
                AI 学习建议
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {record.learningAdvice}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* 排行榜 + 知识点分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 排行榜 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Trophy className="size-4 text-yellow-500" />
                排行榜
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">暂无排行数据</p>
              ) : (
                <div className="space-y-2">
                  {leaderboard.map((entry, i) => (
                    <div
                      key={`${entry.date}-${i}`}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/50"
                    >
                      <span className={`w-6 text-center text-sm font-bold tabular-nums ${
                        i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-muted-foreground'
                      }`}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold tabular-nums">{entry.score} 分</span>
                          <Badge variant="outline" className="text-xs">{DIFFICULTY_LABELS[entry.difficulty]}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{entry.date}</p>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        {entry.score}/{entry.totalQuestions}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* 知识点错题分布 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="size-4 text-blue-500" />
                薄弱知识点
              </CardTitle>
            </CardHeader>
            <CardContent>
              {knowledgeChartOption.series ? (
                <ReactECharts
                  option={knowledgeChartOption}
                  theme="ud"
                  style={{ height: '240px' }}
                />
              ) : (
                <p className="text-sm text-muted-foreground text-center py-6">全部正确，没有薄弱知识点 🎉</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 答题详情列表 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="size-4 text-primary" />
              答题详情
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="max-h-[600px]">
              <div className="px-6 pb-6 space-y-2">
                {record.answers.map((answer, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border ${
                      answer.isCorrect
                        ? 'border-green-200 bg-green-50/50'
                        : 'border-red-200 bg-red-50/50'
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full flex items-start gap-3 p-4 text-left"
                      onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                    >
                      <div className="shrink-0 mt-0.5">
                        {answer.isCorrect ? (
                          <CheckCircle2 className="size-5 text-green-600" />
                        ) : (
                          <XCircle className="size-5 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs text-muted-foreground">
                            第 {answer.questionIndex + 1} 题
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {TYPE_LABELS[answer.questionType] || answer.questionType}
                          </Badge>
                          {answer.knowledgePoint && (
                            <Badge variant="secondary" className="text-xs">
                              {answer.knowledgePoint}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{answer.question}</p>
                        {!answer.isCorrect && (
                          <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-xs">
                            <span className="text-red-600">
                              你的答案：<span className="font-semibold">{answer.userAnswer || '未作答'}</span>
                            </span>
                            <span className="text-green-700">
                              正确答案：<span className="font-semibold">{answer.correctAnswer}</span>
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="shrink-0">
                        {expandedIndex === i ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {expandedIndex === i && answer.aiExplanation && (
                      <div className="px-4 pb-4 pt-0 border-t border-border/40 mx-4">
                        <Separator className="mb-3" />
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {answer.aiExplanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
