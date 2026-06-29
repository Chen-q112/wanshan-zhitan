import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@lark-apaas/client-toolkit-lite';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, CheckCircle2, XCircle, ArrowRight, Sparkles, Loader2, Trophy } from 'lucide-react';
import { MOCK_MOUNTAINS } from '@/data/mountains';
import { callAgnesStream } from '@/lib/agnes-api';
import {
  type IAnswerRecord,
  type IQuizRecord,
  type IWrongAnswer,
  saveQuizRecord,
  saveWrongAnswer,
  saveLeaderboardEntry,
} from '@/lib/storage';

// ==================== 类型 ====================

type QuizPhase = 'config' | 'generating' | 'answering' | 'explaining' | 'complete';
type Difficulty = 'beginner' | 'intermediate' | 'expert';
type QuestionType = 'choice' | 'truefalse' | 'fillblank';

interface ParsedQuestion {
  index: number;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '进阶',
  expert: '专家',
};

const DIFFICULTY_PLUGIN_LABELS: Record<Difficulty, string> = {
  beginner: '简单',
  intermediate: '中等',
  expert: '困难',
};

const TYPE_LABELS: Record<QuestionType, string> = {
  choice: '选择题',
  truefalse: '判断题',
  fillblank: '填空题',
};

const ALL_TYPES: QuestionType[] = ['choice', 'truefalse', 'fillblank'];

// ==================== 题目解析 ====================

function parseQuestions(raw: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  const sections = raw.split(/【(.+?)】\s*/);
  let currentType: QuestionType = 'choice';
  let globalIndex = 0;

  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i].trim();
    if (!sec) continue;

    if (sec.includes('选择')) { currentType = 'choice'; continue; }
    if (sec.includes('判断')) { currentType = 'truefalse'; continue; }
    if (sec.includes('填空')) { currentType = 'fillblank'; continue; }

    const blocks = sec.split(/\n(?=\d+\.\s)/);
    for (const block of blocks) {
      const trimmed = block.trim();
      if (!trimmed) continue;

      const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) continue;

      const qMatch = lines[0].match(/^\d+\.\s*(.+)/);
      if (!qMatch) continue;
      const questionText = qMatch[1].replace(/____/g, '________');

      if (currentType === 'choice') {
        const options: string[] = [];
        for (const line of lines) {
          const optMatch = line.match(/^([A-D])\.\s*(.+)/);
          if (optMatch) options.push(optMatch[2]);
        }
        const answerLine = lines.find((l) => l.startsWith('正确答案'));
        const correctAnswer = answerLine?.replace(/^正确答案[：:]\s*/, '').trim() || '';
        questions.push({ index: globalIndex++, type: 'choice', question: questionText, options, correctAnswer });
      } else if (currentType === 'truefalse') {
        const answerLine = lines.find((l) => l.startsWith('正确答案'));
        const correctAnswer = answerLine?.replace(/^正确答案[：:]\s*/, '').trim() || '';
        questions.push({ index: globalIndex++, type: 'truefalse', question: questionText, options: [], correctAnswer });
      } else if (currentType === 'fillblank') {
        const answerLine = lines.find((l) => l.startsWith('参考答案'));
        const correctAnswer = answerLine?.replace(/^参考答案[：:]\s*/, '').trim() || '';
        questions.push({ index: globalIndex++, type: 'fillblank', question: questionText, options: [], correctAnswer });
      }
    }
  }
  return questions;
}

function normalizeAnswer(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

// ==================== 组件 ====================

export default function QuizPage() {
  const navigate = useNavigate();

  // --- 配置 ---
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(['choice']);
  const [questionCount, setQuestionCount] = useState(5);

  // --- 测验状态 ---
  const [phase, setPhase] = useState<QuizPhase>('config');
  const [questions, setQuestions] = useState<ParsedQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<IAnswerRecord[]>([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('beginner');

  // --- 答题交互 ---
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [fillAnswer, setFillAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // --- AI 解析 ---
  const [explanation, setExplanation] = useState('');
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false);
  const explanationRef = useRef('');

  // --- 生成题目 ---
  const generateQuestions = useCallback(async (diff: Difficulty, count: number, types: QuestionType[]) => {
    setPhase('generating');
    const typeStr = types.map((t) => TYPE_LABELS[t]).join('、');
    const difficultyLabel = DIFFICULTY_PLUGIN_LABELS[diff];
    
    try {
      const prompt = `请生成${count}道关于安徽山脉地质地貌、生态文化知识的测验题目，难度为${difficultyLabel}，包含${typeStr}。

请严格按照以下格式输出：

【选择题】
1. 题目内容
A. 选项一
B. 选项二
C. 选项三
D. 选项四
正确答案：A

2. 题目内容
A. 选项一
B. 选项二
C. 选项三
D. 选项四
正确答案：B

【判断题】
1. 题目内容
正确答案：对

2. 题目内容
正确答案：错

【填空题】
1. 题目内容
参考答案：答案内容

2. 题目内容
参考答案：答案内容

确保题目科学准确，覆盖安徽山脉的地质成因、地貌类型、著名山峰、生态文化等知识点。`;

      const stream = callAgnesStream(prompt);

      let full = '';
      for await (const chunk of stream) {
        full += chunk;
      }

      const parsed = parseQuestions(full);
      if (parsed.length === 0) {
        logger.warn('QuizPage: 题目解析为空，使用原始文本');
        setQuestions([{ index: 0, type: 'choice', question: '题目生成异常，请重试', options: ['重试'], correctAnswer: '重试' }]);
      } else {
        setQuestions(parsed.slice(0, count));
      }
      setCurrentIndex(0);
      setAnswers([]);
      setConsecutiveCorrect(0);
      setConsecutiveWrong(0);
      setCurrentDifficulty(diff);
      setPhase('answering');
    } catch (err) {
      logger.error('QuizPage: 生成题目失败', String(err));
      setPhase('config');
    }
  }, []);

  // --- 开始测验 ---
  const handleStart = () => {
    if (selectedTypes.length === 0) return;
    setCurrentDifficulty(difficulty);
    generateQuestions(difficulty, questionCount, selectedTypes);
  };

  // --- 提交答案 ---
  const handleSubmitAnswer = async () => {
    const q = questions[currentIndex];
    if (!q) return;

    let userAnswer = '';
    if (q.type === 'choice') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else if (q.type === 'truefalse') {
      if (!selectedOption) return;
      userAnswer = selectedOption;
    } else if (q.type === 'fillblank') {
      if (!fillAnswer.trim()) return;
      userAnswer = fillAnswer.trim();
    }

    const correct = normalizeAnswer(userAnswer) === normalizeAnswer(q.correctAnswer);
    setIsCorrect(correct);
    setIsSubmitted(true);

    const record: IAnswerRecord = {
      questionIndex: currentIndex,
      question: q.question,
      questionType: q.type,
      userAnswer,
      correctAnswer: q.correctAnswer,
      isCorrect: correct,
      knowledgePoint: '安徽山脉',
    };

    setAnswers((prev) => [...prev, record]);

    if (correct) {
      const newCC = consecutiveCorrect + 1;
      setConsecutiveCorrect(newCC);
      setConsecutiveWrong(0);

      if (newCC >= 3 && currentDifficulty !== 'expert') {
        const nextDiff: Difficulty = currentDifficulty === 'beginner' ? 'intermediate' : 'expert';
        setCurrentDifficulty(nextDiff);
        setConsecutiveCorrect(0);
        const remaining = questions.length - currentIndex - 1;
        if (remaining > 0) {
          await generateQuestions(nextDiff, remaining, selectedTypes);
          return;
        }
      }
    } else {
      const newCW = consecutiveWrong + 1;
      setConsecutiveWrong(newCW);
      setConsecutiveCorrect(0);

      if (newCW >= 2 && currentDifficulty !== 'beginner') {
        const nextDiff: Difficulty = currentDifficulty === 'expert' ? 'intermediate' : 'beginner';
        setCurrentDifficulty(nextDiff);
        setConsecutiveWrong(0);
        const remaining = questions.length - currentIndex - 1;
        if (remaining > 0) {
          await generateQuestions(nextDiff, remaining, selectedTypes);
          return;
        }
      }

      // 保存错题
      const wrong: IWrongAnswer = {
        id: `wa_${Date.now()}_${currentIndex}`,
        quizRecordId: '',
        date: new Date().toISOString(),
        question: q.question,
        questionType: q.type,
        userAnswer,
        correctAnswer: q.correctAnswer,
        knowledgePoint: '安徽山脉',
      };
      saveWrongAnswer(wrong);
    }

    // 生成 AI 解析
    setPhase('explaining');
    setIsGeneratingExplanation(true);
    explanationRef.current = '';
    setExplanation('');

    try {
      const prompt = `题目：${q.question}
用户答案：${userAnswer}
正确答案：${q.correctAnswer}

请对这道题进行详细解析，包括：
1. 答案正确性说明
2. 相关知识点拓展
3. 安徽山脉相关背景知识

请以通俗易懂的语言进行解释。`;

      const stream = callAgnesStream(prompt);

      for await (const chunk of stream) {
        explanationRef.current += chunk;
        setExplanation(explanationRef.current);
      }
    } catch (err) {
      logger.error('QuizPage: 生成解析失败', String(err));
      setExplanation('解析生成失败，请查看正确答案。');
    }
    setIsGeneratingExplanation(false);
  };

  // --- 下一题 / 完成 ---
  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= questions.length) {
      finishQuiz();
      return;
    }
    setCurrentIndex(nextIndex);
    setSelectedOption(null);
    setFillAnswer('');
    setIsSubmitted(false);
    setExplanation('');
    setPhase('answering');
  };

  // --- 完成测验 ---
  const finishQuiz = () => {
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const wrongCount = answers.filter((a) => !a.isCorrect).length;
    const total = answers.length;

    const record: IQuizRecord = {
      id: `qr_${Date.now()}`,
      date: new Date().toISOString(),
      difficulty: difficulty,
      totalQuestions: total,
      correctCount,
      wrongCount,
      score: total > 0 ? Math.round((correctCount / total) * 100) : 0,
      answers,
    };

    saveQuizRecord(record);
    saveLeaderboardEntry({
      date: record.date,
      score: record.score,
      totalQuestions: total,
      difficulty: DIFFICULTY_LABELS[difficulty],
    });

    // 更新错题的 quizRecordId
    const wrongAnswers = answers.filter((a) => !a.isCorrect);
    wrongAnswers.forEach((wa) => {
      const wrong: IWrongAnswer = {
        id: `wa_${Date.now()}_${wa.questionIndex}`,
        quizRecordId: record.id,
        date: record.date,
        question: wa.question,
        questionType: wa.questionType,
        userAnswer: wa.userAnswer,
        correctAnswer: wa.correctAnswer,
        knowledgePoint: wa.knowledgePoint || '安徽山脉',
      };
      saveWrongAnswer(wrong);
    });

    navigate('/quiz/result', { state: { record } });
  };

  // --- 切换题型 ---
  const toggleType = (t: QuestionType) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  // --- 渲染 ---
  const q = questions[currentIndex];
  const progressValue = questions.length > 0 ? ((currentIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100 : 0;
  const correctSoFar = answers.filter((a) => a.isCorrect).length;
  const wrongSoFar = answers.filter((a) => !a.isCorrect).length;

  return (
    <div className="space-y-6">
      {/* ========== 配置阶段 ========== */}
      {phase === 'config' && (
        <Card className="max-w-xl mx-auto overflow-hidden">
          <div className="absolute inset-0 ink-texture-bg opacity-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-24 mountain-silhouette opacity-10 pointer-events-none" />
          <CardHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="size-14 rounded-xl bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center shadow-md backdrop-blur-sm border border-primary/10">
                <Brain className="size-7 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">智能知识测验</CardTitle>
                <CardDescription>
                  AI 将根据你的水平自适应出题，测试你对安徽山脉知识的掌握程度
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 难度 */}
            <div className="space-y-2">
              <Label>难度等级</Label>
              <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="beginner">🌱 入门</TabsTrigger>
                  <TabsTrigger value="intermediate">📚 进阶</TabsTrigger>
                  <TabsTrigger value="expert">🏔️ 专家</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* 题型 */}
            <div className="space-y-2">
              <Label>题目类型</Label>
              <div className="flex flex-wrap gap-3">
                {ALL_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selectedTypes.includes(t)}
                      onCheckedChange={() => toggleType(t)}
                    />
                    <span className="text-sm">{TYPE_LABELS[t]}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 题数 */}
            <div className="space-y-2">
              <Label>题目数量（3-20）</Label>
              <Input
                type="number"
                min={3}
                max={20}
                value={questionCount}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) setQuestionCount(Math.min(20, Math.max(3, v)));
                }}
                className="w-32"
              />
            </div>

            <Button
              size="lg"
              className="w-full"
              disabled={selectedTypes.length === 0}
              onClick={handleStart}
            >
              <Sparkles className="size-4 mr-2" />
              开始测验
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ========== 生成中 ========== */}
      {phase === 'generating' && (
        <Card className="max-w-xl mx-auto">
          <CardContent className="py-12 flex flex-col items-center gap-4">
            <Loader2 className="size-10 text-primary animate-spin" />
            <p className="text-lg font-medium text-foreground">AI 正在生成题目...</p>
            <p className="text-sm text-muted-foreground">
              {DIFFICULTY_LABELS[currentDifficulty]}难度 · {selectedTypes.map((t) => TYPE_LABELS[t]).join('、')}
            </p>
            <div className="w-full max-w-xs space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========== 答题 / 解析阶段 ========== */}
      {(phase === 'answering' || phase === 'explaining') && q && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* 进度条 */}
          <Card>
            <CardContent className="py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  第 {currentIndex + 1} / {questions.length} 题
                </span>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">
                    {DIFFICULTY_LABELS[currentDifficulty]}
                  </Badge>
                  <span className="flex items-center gap-1 text-success">
                    <CheckCircle2 className="size-3.5" />
                    {correctSoFar}
                  </span>
                  <span className="flex items-center gap-1 text-destructive">
                    <XCircle className="size-3.5" />
                    {wrongSoFar}
                  </span>
                </div>
              </div>
              <Progress value={progressValue} className="h-2" />
            </CardContent>
          </Card>

          {/* 题目 */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {TYPE_LABELS[q.type]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  第 {currentIndex + 1} 题
                </span>
              </div>
              <CardTitle className="text-lg leading-relaxed mt-2">
                {q.question}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 选择题 */}
              {q.type === 'choice' && (
                <div className="space-y-2">
                  {q.options.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = selectedOption === opt;
                    const isCorrectAnswer = isSubmitted && normalizeAnswer(opt) === normalizeAnswer(q.correctAnswer);
                    const isWrongSelected = isSubmitted && isSelected && !isCorrect;

                    let btnVariant: 'outline' | 'default' | 'secondary' = 'outline';
                    if (isSubmitted) {
                      if (isCorrectAnswer) btnVariant = 'default';
                      else if (isWrongSelected) btnVariant = 'secondary';
                    } else if (isSelected) {
                      btnVariant = 'default';
                    }

                    let extraClass = '';
                    if (isSubmitted && isCorrectAnswer) extraClass = 'border-success bg-success/10 text-success';
                    else if (isWrongSelected) extraClass = 'border-destructive bg-destructive/10 text-destructive';

                    return (
                      <Button
                        key={letter}
                        variant={btnVariant}
                        disabled={isSubmitted}
                        className={`w-full justify-start h-auto py-3 px-4 text-left ${extraClass}`}
                        onClick={() => setSelectedOption(opt)}
                      >
                        <span className="font-semibold mr-3 shrink-0">{letter}.</span>
                        <span className="flex-1">{opt}</span>
                        {isSubmitted && isCorrectAnswer && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                        {isWrongSelected && <XCircle className="size-4 shrink-0 text-destructive" />}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* 判断题 */}
              {q.type === 'truefalse' && (
                <div className="flex gap-3">
                  {['对', '错'].map((opt) => {
                    const isSelected = selectedOption === opt;
                    const isCorrectAnswer = isSubmitted && normalizeAnswer(opt) === normalizeAnswer(q.correctAnswer);
                    const isWrongSelected = isSubmitted && isSelected && !isCorrectAnswer;

                    let btnVariant: 'outline' | 'default' | 'secondary' = 'outline';
                    if (isSubmitted) {
                      if (isCorrectAnswer) btnVariant = 'default';
                      else if (isWrongSelected) btnVariant = 'secondary';
                    } else if (isSelected) {
                      btnVariant = 'default';
                    }

                    let extraClass = '';
                    if (isSubmitted && isCorrectAnswer) extraClass = 'border-success bg-success/10 text-success';
                    else if (isWrongSelected) extraClass = 'border-destructive bg-destructive/10 text-destructive';

                    return (
                      <Button
                        key={opt}
                        variant={btnVariant}
                        disabled={isSubmitted}
                        size="lg"
                        className={`flex-1 h-16 text-lg ${extraClass}`}
                        onClick={() => setSelectedOption(opt)}
                      >
                        {opt === '对' ? '✓ 正确' : '✗ 错误'}
                        {isSubmitted && isCorrectAnswer && <CheckCircle2 className="size-5 shrink-0 text-success ml-2" />}
                        {isWrongSelected && <XCircle className="size-5 shrink-0 text-destructive ml-2" />}
                      </Button>
                    );
                  })}
                </div>
              )}

              {/* 填空题 */}
              {q.type === 'fillblank' && (
                <div className="space-y-3">
                  <Input
                    placeholder="请输入你的答案..."
                    value={fillAnswer}
                    onChange={(e) => setFillAnswer(e.target.value)}
                    disabled={isSubmitted}
                    className="text-base"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSubmitted) handleSubmitAnswer();
                    }}
                  />
                  {isSubmitted && (
                    <div className={`p-3 rounded-md text-sm ${isCorrect ? 'bg-success/10 text-success border border-success/30' : 'bg-destructive/10 text-destructive border border-destructive/30'}`}>
                      {isCorrect ? (
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4" />回答正确！</span>
                      ) : (
                        <span>正确答案：<strong>{q.correctAnswer}</strong></span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 提交按钮 */}
              {!isSubmitted && (
                <Button
                  className="w-full mt-4"
                  size="lg"
                  disabled={
                    (q.type === 'choice' && !selectedOption) ||
                    (q.type === 'truefalse' && !selectedOption) ||
                    (q.type === 'fillblank' && !fillAnswer.trim())
                  }
                  onClick={handleSubmitAnswer}
                >
                  提交答案
                </Button>
              )}
            </CardContent>
          </Card>

          {/* AI 解析 */}
          {phase === 'explaining' && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="size-4 text-primary" />
                  AI 解析与知识点拓展
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGeneratingExplanation && !explanation ? (
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                ) : (
                  <div className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                    {explanation || '暂无解析'}
                  </div>
                )}
                {isGeneratingExplanation && explanation && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    正在生成更多内容...
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 下一题 / 完成 */}
          {isSubmitted && (
            <div className="flex justify-end gap-3">
              {currentIndex < questions.length - 1 ? (
                <Button size="lg" onClick={handleNext} disabled={isGeneratingExplanation}>
                  下一题
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              ) : (
                <Button size="lg" onClick={handleNext} disabled={isGeneratingExplanation}>
                  <Trophy className="size-4 mr-2" />
                  查看成绩报告
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
