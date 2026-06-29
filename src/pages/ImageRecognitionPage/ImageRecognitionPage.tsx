import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Mountain, MapPin, Ruler, Sparkles, X, History, AlertCircle, CheckCircle2, Image as ImageIcon, ChevronRight, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { logger, scopedStorage } from '@lark-apaas/client-toolkit-lite';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Image } from '@/components/ui/image';
import { IMountain, MOCK_MOUNTAINS } from '@/data/mountains';
import { callAgnesImageRecognitionStream } from '@/lib/agnes-api';

// ==================== 类型定义 ====================

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

// ==================== 存储 ====================

const STORAGE_KEY = '__global_wanshan_recognition_history';

function loadHistory(): IRecognitionRecord[] {
  try {
    const raw = scopedStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(records: IRecognitionRecord[]) {
  try {
    scopedStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, 20)));
  } catch (e) {
    logger.error('Failed to save recognition history:', String(e));
  }
}

// ==================== 常量 ====================

const landformLabels: Record<string, string> = {
  granite: '花岗岩地貌',
  danxia: '丹霞地貌',
  volcanic: '火山地貌',
  other: '其他地貌',
};

const landformColors: Record<string, string> = {
  granite: 'bg-blue-100 text-blue-700 border-blue-200',
  danxia: 'bg-orange-100 text-orange-700 border-orange-200',
  volcanic: 'bg-red-100 text-red-700 border-red-200',
  other: 'bg-muted text-muted-foreground border-border',
};

// ==================== 组件 ====================

export default function ImageRecognitionPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState('');
  const [parsedResult, setParsedResult] = useState<{
    mountainName: string;
    confidence: number;
    landformType: string;
    elevation: number;
    location: string;
    geology: string;
  } | null>(null);
  const [matchedMountain, setMatchedMountain] = useState<IMountain | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [history, setHistory] = useState<IRecognitionRecord[]>(() => loadHistory());
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==================== 工具函数 ====================

  const resetState = useCallback(() => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setIsRecognizing(false);
    setRecognitionResult('');
    setParsedResult(null);
    setMatchedMountain(null);
    setShowFeedback(false);
    setFeedbackText('');
  }, []);

  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('图片大小不能超过20MB');
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setRecognitionResult('');
    setParsedResult(null);
    setMatchedMountain(null);
    setShowFeedback(false);
  }, []);

  const handleFileInput = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const parseRecognitionText = useCallback((text: string) => {
    const result = {
      mountainName: '',
      confidence: 0,
      landformType: '',
      elevation: 0,
      location: '',
      geology: '',
    };

    const nameMatch = text.match(/(?:山峰名称|识别结果|名称)[：:]\s*(.+?)(?:\n|$)/i);
    if (nameMatch) result.mountainName = nameMatch[1].trim();

    const confMatch = text.match(/(?:置信度|相似度|匹配度)[：:]\s*(\d+)/i);
    if (confMatch) result.confidence = parseInt(confMatch[1], 10);

    const landMatch = text.match(/(?:地貌类型|地貌)[：:]\s*(.+?)(?:\n|$)/i);
    if (landMatch) result.landformType = landMatch[1].trim();

    const elevMatch = text.match(/(?:海拔|海拔高度)[：:]\s*([\d.]+)/i);
    if (elevMatch) result.elevation = parseFloat(elevMatch[1]);

    const locMatch = text.match(/(?:地理位置|所在地区|位置)[：:]\s*(.+?)(?:\n|$)/i);
    if (locMatch) result.location = locMatch[1].trim();

    const geoMatch = text.match(/(?:地质特征|地质)[：:]\s*(.+?)(?:\n|$)/i);
    if (geoMatch) result.geology = geoMatch[1].trim();

    return result;
  }, []);

  const findMatchingMountain = useCallback((name: string) => {
    return MOCK_MOUNTAINS.find(
      (m) => name.includes(m.name) || m.name.includes(name),
    );
  }, []);

  // ==================== 核心：AI识别 ====================

  const handleRecognize = useCallback(async () => {
    if (!uploadedFile) return;
    setIsRecognizing(true);
    setRecognitionResult('');
    setParsedResult(null);
    setMatchedMountain(null);

    try {
      const imageBase64 = await fileToBase64(uploadedFile);
      
      let fullContent = '';
      const stream = callAgnesImageRecognitionStream(imageBase64);

      for await (const chunk of stream) {
        fullContent += chunk;
        setRecognitionResult(fullContent);
      }

      const parsed = parseRecognitionText(fullContent);
      setParsedResult(parsed);

      if (parsed.mountainName) {
        const matched = findMatchingMountain(parsed.mountainName);
        setMatchedMountain(matched || null);
      }

      if (parsed.mountainName) {
        const record: IRecognitionRecord = {
          id: Date.now().toString(),
          imageUrl: previewUrl || '',
          mountainName: parsed.mountainName,
          confidence: parsed.confidence || 85,
          landformType: parsed.landformType || 'other',
          elevation: parsed.elevation || 0,
          location: parsed.location || '',
          timestamp: new Date().toISOString(),
        };
        const updated = [record, ...history];
        setHistory(updated);
        saveHistory(updated);
      }
    } catch (err) {
      logger.error('Image recognition failed:', String(err));
      toast.error('识别失败，请重试');
    } finally {
      setIsRecognizing(false);
    }
  }, [uploadedFile, previewUrl, history, parseRecognitionText, findMatchingMountain, fileToBase64]);

  // ==================== 反馈 ====================

  const handleFeedbackSubmit = useCallback(() => {
    if (!feedbackText.trim()) return;
    toast.success('感谢反馈，我们会持续改进识别准确度');
    setShowFeedback(false);
    setFeedbackText('');
  }, [feedbackText]);

  // ==================== 历史管理 ====================

  const handleDeleteHistory = useCallback((id: string) => {
    const updated = history.filter((r) => r.id !== id);
    setHistory(updated);
    saveHistory(updated);
  }, [history]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
    toast.success('识别历史已清空');
  }, []);

  const handleHistoryClick = useCallback((record: IRecognitionRecord) => {
    setPreviewUrl(record.imageUrl);
    setUploadedFile(null);
    setRecognitionResult('');
    const parsed = {
      mountainName: record.mountainName,
      confidence: record.confidence,
      landformType: record.landformType,
      elevation: record.elevation,
      location: record.location,
      geology: '',
    };
    setParsedResult(parsed);
    const matched = findMatchingMountain(record.mountainName);
    setMatchedMountain(matched || null);
  }, [findMatchingMountain]);

  // ==================== 置信度样式 ====================

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  // ==================== 渲染 ====================

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-sm">
          <Camera className="size-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">山峰图像识别</h1>
          <p className="text-sm text-muted-foreground">上传山峰图片，AI自动识别并给出详细科普信息</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========== 左侧：上传区 + 识别历史 ========== */}
        <div className="space-y-6">
          {/* 上传区 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Upload className="size-4 text-primary" />
                上传山峰图片
              </CardTitle>
              <CardDescription>支持 JPG、PNG、WebP，最大 20MB</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AnimatePresence mode="wait">
                {!previewUrl ? (
                  <motion.div
                    key="upload-zone"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all cursor-pointer overflow-hidden ${
                      dragOver
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="absolute inset-0 ink-texture-bg opacity-50" />
                    <div className="absolute bottom-0 left-0 right-0 h-24 mountain-silhouette opacity-30" />
                    
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/10 flex items-center justify-center mb-6 shadow-md backdrop-blur-sm border border-primary/10">
                        <div className="size-14 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                          <Mountain className="size-7 text-primary" />
                        </div>
                      </div>
                      <p className="text-base font-medium text-foreground mb-2">
                        点击上传或拖拽山峰图片
                      </p>
                      <p className="text-sm text-muted-foreground">
                        支持识别安徽17座名山，包括黄山、九华山、天柱山等
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative rounded-xl overflow-hidden border border-border"
                  >
                    <Image
                      src={previewUrl}
                      alt="上传的山峰图片"
                      className="w-full aspect-[4/3] object-cover"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="!absolute right-2 top-2 z-20 h-7 w-7 rounded-full shadow-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        resetState();
                      }}
                      aria-label="移除图片"
                    >
                      <X className="size-3.5" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              {previewUrl && (
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                  onClick={handleRecognize}
                  disabled={isRecognizing}
                >
                  {isRecognizing ? (
                    <>
                      <Sparkles className="size-4 mr-2 animate-pulse" />
                      AI识别中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4 mr-2" />
                      开始识别
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 识别历史 */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="size-4 text-muted-foreground" />
                  识别历史
                </CardTitle>
                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={handleClearHistory}
                  >
                    <Trash2 className="size-3 mr-1" />
                    清空
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {history.length === 0 ? (
                <div className="px-6 pb-6 text-center">
                  <p className="text-sm text-muted-foreground">暂无识别记录</p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  <div className="px-3 pb-3 space-y-1">
                    {history.map((record) => (
                      <button
                        key={record.id}
                        type="button"
                        onClick={() => handleHistoryClick(record)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                      >
                        <div className="size-10 rounded-lg overflow-hidden shrink-0 border border-border">
                          <Image
                            src={record.imageUrl}
                            alt={record.mountainName}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{record.mountainName}</p>
                          <p className="text-xs text-muted-foreground">
                            {record.location}{record.elevation > 0 ? ` · ${record.elevation}m` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`text-xs font-semibold ${getConfidenceColor(record.confidence)}`}>
                            {record.confidence}%
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteHistory(record.id);
                            }}
                            aria-label="删除记录"
                          >
                            <X className="size-3" />
                          </Button>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ========== 右侧：识别结果 ========== */}
        <div className="lg:col-span-2 space-y-6">
          {/* 识别中状态 */}
          {isRecognizing && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="py-8">
                <div className="flex flex-col items-center gap-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="size-12 rounded-full border-2 border-primary border-t-transparent"
                  />
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground flex items-center gap-2 justify-center">
                      <Sparkles className="size-4 text-primary animate-pulse" />
                      AI正在分析山峰特征...
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      正在识别地貌类型、海拔、地理位置等信息
                    </p>
                  </div>
                  {recognitionResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="w-full max-h-60 overflow-y-auto rounded-lg bg-card border border-border p-4"
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                        {recognitionResult}
                      </p>
                    </motion.div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 识别结果卡片 */}
          <AnimatePresence>
            {!isRecognizing && parsedResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Mountain className="size-5 text-primary" />
                          <CardTitle className="text-xl">
                            {parsedResult.mountainName || '识别结果'}
                          </CardTitle>
                          {parsedResult.landformType && (
                            <Badge
                              variant="outline"
                              className={`text-xs shrink-0 ${
                                landformColors[parsedResult.landformType] || landformColors.other
                              }`}
                            >
                              {landformLabels[parsedResult.landformType] || parsedResult.landformType}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="flex items-center gap-1">
                          <CheckCircle2 className="size-3 text-green-500" />
                          识别完成
                        </CardDescription>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-2xl font-black tabular-nums ${getConfidenceColor(parsedResult.confidence)}`}>
                          {parsedResult.confidence}%
                        </span>
                        <p className="text-xs text-muted-foreground">置信度</p>
                      </div>
                    </div>
                    <Progress
                      value={parsedResult.confidence}
                      className="h-1.5 mt-3"
                    />
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {parsedResult.elevation > 0 && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                          <Ruler className="size-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">海拔高度</p>
                            <p className="text-sm font-semibold tabular-nums">
                              {parsedResult.elevation.toLocaleString()} 米
                            </p>
                          </div>
                        </div>
                      )}
                      {parsedResult.location && (
                        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50">
                          <MapPin className="size-4 text-muted-foreground shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground">所在地区</p>
                            <p className="text-sm font-semibold truncate">{parsedResult.location}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {parsedResult.geology && (
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">地质特征</p>
                        <p className="text-sm leading-relaxed">{parsedResult.geology}</p>
                      </div>
                    )}

                    {/* 反馈区 */}
                    <div className="pt-2">
                      {!showFeedback ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => setShowFeedback(true)}
                        >
                          <AlertCircle className="size-3 mr-1" />
                          识别有误？点此反馈
                        </Button>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-2"
                        >
                          <textarea
                            className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                            rows={3}
                            placeholder="请描述识别错误的地方，帮助我们改进..."
                            value={feedbackText}
                            onChange={(e) => setFeedbackText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleFeedbackSubmit}>
                              提交反馈
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setShowFeedback(false);
                                setFeedbackText('');
                              }}
                            >
                              取消
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 匹配到的山脉详细科普 */}
          <AnimatePresence>
            {!isRecognizing && matchedMountain && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ChevronRight className="size-5 text-primary" />
                      {matchedMountain.name} 详细科普
                    </CardTitle>
                    <CardDescription>{matchedMountain.location}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {matchedMountain.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-border">
                        <Image
                          src={matchedMountain.imageUrl}
                          alt={matchedMountain.name}
                          className="w-full aspect-[16/9] object-cover"
                        />
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{matchedMountain.description}</p>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                        <Sparkles className="size-3.5 text-primary" />
                        地质成因
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {matchedMountain.geology}
                      </p>
                    </div>
                    {matchedMountain.highlights.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                            <Mountain className="size-3.5 text-primary" />
                            特色亮点
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {matchedMountain.highlights.map((h) => (
                              <Badge key={h} variant="secondary" className="text-xs">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 空状态 */}
          {!isRecognizing && !parsedResult && !recognitionResult && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="size-20 rounded-2xl bg-gradient-to-br from-blue-100 to-emerald-100 flex items-center justify-center mb-6">
                <ImageIcon className="size-10 text-primary/60" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                等待识别
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                上传一张安徽山峰的图片，AI将自动识别山峰名称、地貌类型、海拔高度等地质信息
              </p>
              <div className="mt-6 flex flex-wrap gap-2 justify-center">
                {MOCK_MOUNTAINS.slice(0, 4).map((m) => (
                  <Badge key={m.id} variant="outline" className="text-xs">
                    {m.name}
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  +13座名山
                </Badge>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
