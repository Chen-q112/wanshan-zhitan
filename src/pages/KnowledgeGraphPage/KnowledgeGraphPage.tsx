import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { CallbackDataParams } from 'echarts/types/dist/shared';
import { Search, X, ZoomIn, ZoomOut, RotateCcw, Info, MapPin, Mountain, TreePine, BookOpen, Ruler, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Image } from '@/components/ui/image';
import { cn } from '@/lib/utils';
import {
  IKnowledgeNode,
  IKnowledgeEdge,
  ALL_NODES,
  ALL_EDGES,
  VIEW_CONFIGS,
} from '@/lib/knowledge-graph-data';

type ViewType = 'landform' | 'range' | 'ecology' | 'culture';

const CATEGORY_COLORS: Record<IKnowledgeNode['category'], string> = {
  mountain: '#1E88E5',
  landform: '#2E7D32',
  range: '#546E7A',
  ecology: '#43A047',
  culture: '#8D6E63',
};

const CATEGORY_LABELS: Record<IKnowledgeNode['category'], string> = {
  mountain: '山峰',
  landform: '地貌',
  range: '山系',
  ecology: '生态',
  culture: '文化',
};

const CATEGORY_ICONS: Record<IKnowledgeNode['category'], typeof Mountain> = {
  mountain: Mountain,
  landform: MapPin,
  range: MapPin,
  ecology: TreePine,
  culture: BookOpen,
};

export default function KnowledgeGraphPage() {
  const [view, setView] = useState<ViewType>('landform');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<IKnowledgeNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const chartRef = useRef<any>(null);

  const currentViewConfig = useMemo(
    () => VIEW_CONFIGS.find((c) => c.key === view) ?? VIEW_CONFIGS[0],
    [view],
  );

  const { nodes, edges } = useMemo(() => {
    const filteredNodes = ALL_NODES.filter(currentViewConfig.nodeFilter);
    const filteredEdges = ALL_EDGES.filter(currentViewConfig.edgeFilter);
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const validEdges = filteredEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target),
    );
    return { nodes: filteredNodes, edges: validEdges };
  }, [currentViewConfig]);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.trim().toLowerCase();
    return ALL_NODES.filter(
      (n) =>
        n.name.toLowerCase().includes(term) ||
        n.description.toLowerCase().includes(term),
    ).slice(0, 8);
  }, [searchTerm]);

  const handleSearchSelect = useCallback((node: IKnowledgeNode) => {
    setSelectedNode(node);
    setDetailOpen(true);
    setSearchTerm('');
  }, []);

  const handleChartClick = useCallback(
    (params: Record<string, unknown>) => {
      const data = params?.data as { id?: string } | undefined;
      const nodeId = data?.id;
      if (!nodeId) return;
      const found = ALL_NODES.find((n) => n.id === nodeId);
      if (found) {
        setSelectedNode(found);
        setDetailOpen(true);
      }
    },
    [],
  );

  const handleZoomIn = () => {
    const instance = chartRef.current?.getEchartsInstance?.();
    if (instance) {
      const option = instance.getOption() as { series?: Array<{ zoom?: number }> };
      const currentZoom = option?.series?.[0]?.zoom ?? 1;
      instance.setOption({ series: [{ zoom: Math.min(currentZoom * 1.3, 5) }] });
    }
  };

  const handleZoomOut = () => {
    const instance = chartRef.current?.getEchartsInstance?.();
    if (instance) {
      const option = instance.getOption() as { series?: Array<{ zoom?: number }> };
      const currentZoom = option?.series?.[0]?.zoom ?? 1;
      instance.setOption({ series: [{ zoom: Math.max(currentZoom / 1.3, 0.2) }] });
    }
  };

  const handleReset = () => {
    const instance = chartRef.current?.getEchartsInstance?.();
    if (instance) {
      instance.setOption({ series: [{ zoom: 1, center: undefined }] });
    }
  };

  const graphOption = useMemo((): EChartsOption => {
    const graphNodes = nodes.map((n) => {
      const isRoot = n.id === 'root';
      const isMountain = n.category === 'mountain';
      return {
        id: n.id,
        name: n.name,
        symbolSize: isRoot ? 64 : isMountain ? 34 : 26,
        category: n.category,
        itemStyle: {
          color: CATEGORY_COLORS[n.category],
          borderColor: '#fff',
          borderWidth: isRoot ? 3 : 2,
          shadowBlur: isRoot ? 16 : isMountain ? 8 : 4,
          shadowColor: CATEGORY_COLORS[n.category] + '40',
        },
        label: {
          show: true,
          fontSize: isRoot ? 14 : isMountain ? 11 : 10,
          fontWeight: (isRoot ? 'bold' : 'normal') as 'bold' | 'normal',
          color: '#374151',
          position: 'bottom' as const,
          distance: isRoot ? 10 : 6,
        },
      };
    });

    const graphLinks = edges.map((e) => ({
      source: e.source,
      target: e.target,
      label: {
        show: true,
        fontSize: 9,
        color: '#9CA3AF',
        formatter: e.relation,
      },
      lineStyle: {
        color: '#D1D5DB',
        curveness: 0.2,
        width: 1.2,
        opacity: 0.6,
      },
    }));

    const categories = (Object.entries(CATEGORY_COLORS) as [IKnowledgeNode['category'], string][]).map(
      ([name, color]) => ({
        name,
        itemStyle: { color },
      }),
    );

    return {
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        textStyle: { color: '#374151', fontSize: 12 },
        formatter: (params: CallbackDataParams) => {
          const cat = (params?.data as { category?: string } | undefined)?.category as IKnowledgeNode['category'] | undefined;
          const catLabel = cat ? CATEGORY_LABELS[cat] : '';
          return `<strong>${params.name}</strong><br/><span style="color:#9CA3AF">${catLabel}</span>`;
        },
      },
      animationDuration: 800,
      animationEasingUpdate: 'cubicInOut',
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          draggable: true,
          force: {
            repulsion: view === 'landform' ? 500 : 400,
            edgeLength: [100, 300],
            gravity: 0.06,
            layoutAnimation: true,
            friction: 0.6,
          },
          categories,
          nodes: graphNodes,
          links: graphLinks,
          lineStyle: {
            color: 'source',
            curveness: 0.2,
            opacity: 0.45,
          },
          emphasis: {
            focus: 'adjacency',
            lineStyle: { width: 3, opacity: 0.9 },
            itemStyle: { shadowBlur: 24, shadowColor: 'rgba(0,0,0,0.25)' },
            label: { fontSize: 13, fontWeight: 'bold' },
          },
          zoom: 1,
        },
      ],
    };
  }, [nodes, edges, view]);

  const onChartReady = useCallback(
    (instance: any) => {
      chartRef.current = instance;
      try {
        const echartsInstance = instance?.getEchartsInstance?.();
        if (echartsInstance) {
          echartsInstance.on('click', handleChartClick as any);
        }
      } catch { /* ignore */ }
    },
    [handleChartClick],
  );

  useEffect(() => {
    const instance = chartRef.current?.getEchartsInstance?.();
    if (instance) {
      instance.off('click');
      instance.on('click', handleChartClick as any);
    }
  }, [handleChartClick]);

  const relatedEdges = useMemo(() => {
    if (!selectedNode || selectedNode.id === 'root') return [];
    return ALL_EDGES.filter(
      (e) => e.source === selectedNode.id || e.target === selectedNode.id,
    );
  }, [selectedNode]);

  return (
    <div className="space-y-6">
      {/* 顶部控制栏 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg font-semibold">🕸️ 地质知识图谱</CardTitle>
            <div className="flex items-center gap-1.5">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomIn} title="放大">
                <ZoomIn className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleZoomOut} title="缩小">
                <ZoomOut className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleReset} title="重置视图">
                <RotateCcw className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索山峰、地貌、文化节点..."
              className="bg-background pl-9 pr-9"
            />
            {searchTerm && (
              <Button
                size="icon"
                variant="ghost"
                className="!absolute right-1.5 top-1/2 z-20 h-7 w-7 -translate-y-1/2"
                onClick={() => setSearchTerm('')}
                aria-label="清除搜索"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {searchResults.length > 0 && searchTerm && (
              <div className="absolute left-0 top-full z-30 mt-1 w-full rounded-md border bg-popover shadow-md">
                {searchResults.map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors"
                    onClick={() => handleSearchSelect(node)}
                  >
                    <Badge
                      variant="outline"
                      className="shrink-0 text-[11px]"
                      style={{
                        borderColor: CATEGORY_COLORS[node.category],
                        color: CATEGORY_COLORS[node.category],
                      }}
                    >
                      {CATEGORY_LABELS[node.category]}
                    </Badge>
                    <span className="truncate">{node.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 视图切换 */}
          <Tabs value={view} onValueChange={(v) => setView(v as ViewType)}>
            <TabsList className="w-full justify-start">
              {VIEW_CONFIGS.map((cfg) => (
                <TabsTrigger key={cfg.key} value={cfg.key} className="text-xs sm:text-sm">
                  {cfg.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* 图谱画布 */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-[520px] w-full">
            <ReactECharts
              ref={chartRef}
              option={graphOption}
              className="h-full w-full"
              onChartReady={onChartReady}
              style={{ height: '100%', width: '100%' }}
              notMerge={false}
              lazyUpdate={false}
            />
            {/* 图例浮层 */}
            <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border bg-card/90 p-3 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Info className="size-3" />
                图例
              </div>
              <div className="mt-2 space-y-1.5">
                {(Object.entries(CATEGORY_LABELS) as [IKnowledgeNode['category'], string][]).map(
                  ([cat, label]) => (
                    <div key={cat} className="flex items-center gap-2 text-xs">
                      <span
                        className="inline-block size-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                      />
                      <span className="text-muted-foreground">{label}</span>
                    </div>
                  ),
                )}
              </div>
            </div>
            {/* 提示浮层 */}
            <div className="pointer-events-none absolute top-4 right-4 text-xs text-muted-foreground bg-card/80 rounded-md px-2.5 py-1.5 backdrop-blur-sm">
              滚轮缩放 · 拖拽平移 · 点击节点查看详情
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 节点详情侧面板 */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <AnimatePresence mode="wait">
            {selectedNode && (
              <motion.div
                key={selectedNode.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2.5">
                    {(() => {
                      const IconComp = CATEGORY_ICONS[selectedNode.category];
                      return (
                        <IconComp
                          className="size-5 shrink-0"
                          style={{ color: CATEGORY_COLORS[selectedNode.category] }}
                        />
                      );
                    })()}
                    <span className="truncate">{selectedNode.name}</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-5">
                  {/* 分类标签 */}
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{
                      borderColor: CATEGORY_COLORS[selectedNode.category],
                      color: CATEGORY_COLORS[selectedNode.category],
                    }}
                  >
                    {CATEGORY_LABELS[selectedNode.category]}
                  </Badge>

                  {/* 海拔 & 位置 (仅山峰) */}
                  {selectedNode.category === 'mountain' && (selectedNode.elevation || selectedNode.location) && (
                    <div className="flex flex-wrap gap-3">
                      {selectedNode.elevation && (
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                          <Ruler className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">海拔</span>
                          <span className="font-medium tabular-nums">{selectedNode.elevation}m</span>
                        </div>
                      )}
                      {selectedNode.location && (
                        <div className="flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1.5 text-xs">
                          <Navigation className="size-3.5 text-muted-foreground" />
                          <span className="text-muted-foreground">位置</span>
                          <span className="font-medium">{selectedNode.location}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 图片 */}
                  {selectedNode.imageUrl && (
                    <div className="overflow-hidden rounded-xl border border-border/40 shadow-sm group">
                      <div className="relative aspect-video overflow-hidden">
                        <Image
                          src={selectedNode.imageUrl}
                          alt={selectedNode.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* 描述 */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {selectedNode.description}
                  </p>

                  {/* 关联节点 */}
                  {selectedNode.id !== 'root' && relatedEdges.length > 0 && (
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold text-foreground">关联节点</p>
                      <div className="flex flex-wrap gap-2">
                        {relatedEdges.map((e) => {
                          const relatedId =
                            e.source === selectedNode.id ? e.target : e.source;
                          const relatedNode = ALL_NODES.find((n) => n.id === relatedId);
                          if (!relatedNode) return null;
                          return (
                            <button
                              key={`${e.source}-${e.target}`}
                              type="button"
                              className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs transition-colors hover:bg-accent"
                              onClick={() => setSelectedNode(relatedNode)}
                            >
                              <span
                                className="inline-block size-2 rounded-full shrink-0"
                                style={{
                                  backgroundColor: CATEGORY_COLORS[relatedNode.category],
                                }}
                              />
                              <span className="truncate max-w-[120px]">{relatedNode.name}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0">
                                {e.relation}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </SheetContent>
      </Sheet>
    </div>
  );
}
