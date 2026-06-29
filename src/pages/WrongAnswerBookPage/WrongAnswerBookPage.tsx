import { useState, useMemo, useCallback } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { scopedStorage, logger } from '@lark-apaas/client-toolkit-lite';
import {
  Trash2,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  BookOpen,
  Lightbulb,
  Tag,
  Calendar,
} from 'lucide-react';

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

const STORAGE_KEY = '__global_wanshan_wrong_answers';

function loadWrongAnswers(): IWrongAnswer[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveWrongAnswers(data: IWrongAnswer[]) {
  try {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    logger.error('Failed to save wrong answers:', String(e));
  }
}

const QUESTION_TYPE_LABELS: Record<string, string> = {
  choice: '选择题',
  truefalse: '判断题',
  fillblank: '填空题',
  image: '图片题',
};

export default function WrongAnswerBookPage() {
  const [wrongAnswers, setWrongAnswers] = useState<IWrongAnswer[]>(loadWrongAnswers);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [retryId, setRetryId] = useState<string | null>(null);
  const [retryInput, setRetryInput] = useState('');
  const [retryResult, setRetryResult] = useState<boolean | null>(null);

  const stats = useMemo(() => {
    const kpMap: Record<string, number> = {};
    wrongAnswers.forEach((wa) => {
      kpMap[wa.knowledgePoint] = (kpMap[wa.knowledgePoint] || 0) + 1;
    });
    const entries = Object.entries(kpMap).sort((a, b) => b[1] - a[1]);
    return { total: wrongAnswers.length, knowledgePoints: entries };
  }, [wrongAnswers]);

  const chartOption: EChartsOption = useMemo(
    () => ({
      tooltip: { trigger: 'axis' },
      grid: { left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true },
      xAxis: { type: 'value', minInterval: 1, axisLabel: { fontSize: 11 } },
      yAxis: {
        type: 'category',
        data: stats.knowledgePoints.map(([kp]) => kp),
        axisLabel: { fontSize: 11, width: 80, overflow: 'truncate' },
      },
      series: [
        {
          type: 'bar',
          data: stats.knowledgePoints.map(([, count]) => count),
          itemStyle: {
            color: '#1E88E5',
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: 16,
        },
      ],
    }),
    [stats],
  );

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setRetryId(null);
    setRetryResult(null);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      const updated = wrongAnswers.filter((wa) => wa.id !== id);
      setWrongAnswers(updated);
      saveWrongAnswers(updated);
      if (expandedId === id) setExpandedId(null);
    },
    [wrongAnswers, expandedId],
  );

  const handleClearAll = useCallback(() => {
    setWrongAnswers([]);
    saveWrongAnswers([]);
    setExpandedId(null);
    setRetryId(null);
  }, []);

  const handleRetry = useCallback(
    (id: string) => {
      if (retryId === id) {
        setRetryId(null);
        setRetryInput('');
        setRetryResult(null);
      } else {
        setRetryId(id);
        setRetryInput('');
        setRetryResult(null);
      }
    },
    [retryId],
  );

  const handleRetrySubmit = useCallback(() => {
    const item = wrongAnswers.find((wa) => wa.id === retryId);
    if (!item || !retryInput.trim()) return;
    const isCorrect = retryInput.trim() === item.correctAnswer.trim();
    setRetryResult(isCorrect);
  }, [retryId, retryInput, wrongAnswers]);

  const sortedAnswers = useMemo(
    () => [...wrongAnswers].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [wrongAnswers],
  );

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      {wrongAnswers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen className="size-4" />
                错题总数
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-4xl font-bold tabular-nums text-foreground">
                {stats.total}
              </span>
              <span className="text-sm text-muted-foreground ml-2">道</span>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Tag className="size-4" />
                知识点分布
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.knowledgePoints.length > 0 ? (
                <ReactECharts option={chartOption} theme="ud" className="h-[200px]" />
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  暂无数据
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Wrong Answer List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="size-5 text-warning" />
            错题列表
          </CardTitle>
          {wrongAnswers.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll}>
              <Trash2 className="size-4" />
              <span className="ml-1">清空全部</span>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {sortedAnswers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Check className="size-8 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">
                暂无错题
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                你还没有答错的题目，继续保持！去测验页面挑战一下吧。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedAnswers.map((wa) => {
                const isExpanded = expandedId === wa.id;
                const isRetrying = retryId === wa.id;

                return (
                  <div
                    key={wa.id}
                    className="rounded-lg border border-border bg-card transition-colors"
                  >
                    {/* Header */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(wa.id)}
                      className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
                    >
                      {isExpanded ? (
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{wa.question}</p>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            {QUESTION_TYPE_LABELS[wa.questionType] || wa.questionType}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {wa.knowledgePoint}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            {wa.date}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(wa.id);
                        }}
                        aria-label="删除"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </button>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                        {/* Answer Comparison */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="rounded-md bg-destructive/5 border border-destructive/20 p-3">
                            <p className="text-xs font-medium text-destructive mb-1 flex items-center gap-1">
                              <X className="size-3" />
                              你的答案
                            </p>
                            <p className="text-sm">{wa.userAnswer || '（未作答）'}</p>
                          </div>
                          <div className="rounded-md bg-success/5 border border-success/20 p-3">
                            <p className="text-xs font-medium text-success mb-1 flex items-center gap-1">
                              <Check className="size-3" />
                              正确答案
                            </p>
                            <p className="text-sm font-medium">{wa.correctAnswer}</p>
                          </div>
                        </div>

                        {/* AI Explanation */}
                        {wa.aiExplanation && (
                          <div className="rounded-md bg-muted/50 p-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                              <Lightbulb className="size-3" />
                              AI 解析
                            </p>
                            <p className="text-sm leading-relaxed whitespace-pre-line">
                              {wa.aiExplanation}
                            </p>
                          </div>
                        )}

                        {/* Retry Section */}
                        {isRetrying ? (
                          <div className="rounded-md border border-primary/30 bg-primary/5 p-4 space-y-3">
                            <p className="text-sm font-medium text-foreground">
                              重新作答
                            </p>
                            <p className="text-sm text-muted-foreground">{wa.question}</p>
                            <div className="flex items-center gap-2">
                              <Input
                                value={retryInput}
                                onChange={(e) => {
                                  setRetryInput(e.target.value);
                                  setRetryResult(null);
                                }}
                                placeholder="请输入你的答案"
                                className="flex-1"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRetrySubmit();
                                }}
                              />
                              <Button size="sm" onClick={handleRetrySubmit}>
                                提交
                              </Button>
                            </div>
                            {retryResult !== null && (
                              <div
                                className={`flex items-center gap-2 text-sm font-medium rounded-md p-2 ${
                                  retryResult
                                    ? 'bg-success/10 text-success'
                                    : 'bg-destructive/10 text-destructive'
                                }`}
                              >
                                {retryResult ? (
                                  <>
                                    <Check className="size-4" />
                                    回答正确！
                                  </>
                                ) : (
                                  <>
                                    <X className="size-4" />
                                    回答错误，正确答案是：{wa.correctAnswer}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRetry(wa.id)}
                          >
                            <RotateCcw className="size-4" />
                            <span className="ml-1">重新作答</span>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
