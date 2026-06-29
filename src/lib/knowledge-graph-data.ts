// EXPORTS: IKnowledgeNode, IKnowledgeEdge, ALL_NODES, ALL_EDGES, VIEW_CONFIGS

export interface IKnowledgeNode {
  id: string;
  name: string;
  category: 'mountain' | 'landform' | 'range' | 'ecology' | 'culture';
  description: string;
  imageUrl: string;
  elevation?: number;
  location?: string;
}

export interface IKnowledgeEdge {
  source: string;
  target: string;
  relation: string;
}

export interface IViewConfig {
  key: string;
  label: string;
  nodeFilter: (node: IKnowledgeNode) => boolean;
  edgeFilter: (edge: IKnowledgeEdge) => boolean;
}

// ============ 节点数据 ============

export const ALL_NODES: IKnowledgeNode[] = [
  // --- 根节点 ---
  {
    id: 'root',
    name: '安徽山脉',
    category: 'range',
    description: '安徽省境内17座名山，涵盖花岗岩、丹霞、火山三大地貌类型，横跨黄山山脉、九华山山脉、大别山脉、江淮丘陵四大山系。',
    imageUrl: '',
  },

  // --- 地貌类型 ---
  {
    id: 'landform-granite',
    name: '花岗岩地貌',
    category: 'landform',
    description: '岩浆侵入→地壳抬升→风化剥蚀→重力崩塌。安徽代表：黄山、九华山、天柱山、大别山。景观特征：奇峰、怪石、悬崖、深谷。地质年代：燕山期（距今约1.4亿年）。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihscyeiao_ve_miaoda',
  },
  {
    id: 'landform-danxia',
    name: '丹霞地貌',
    category: 'landform',
    description: '红层沉积→地壳抬升→流水侵蚀→风化剥落。安徽代表：齐云山。景观特征：赤壁丹崖、方山、石墙、石柱。颜色成因：氧化铁含量高。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihsn3wobi_ve_miaoda',
  },
  {
    id: 'landform-volcanic',
    name: '火山地貌',
    category: 'landform',
    description: '岩浆喷发→熔岩流动→火山灰沉积→风化侵蚀。安徽代表：浮山、大蜀山、女山。景观特征：火山口、熔岩台地、火山弹、柱状节理。喷发类型：裂隙式、中心式。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihtiuq4hg_ve_miaoda',
  },

  // --- 山系分布 ---
  {
    id: 'range-huangshan',
    name: '黄山山脉',
    category: 'range',
    description: '位于皖南，以黄山为核心，包括牯牛降、齐云山等，是中国东南部最重要的山脉之一。',
    imageUrl: '',
  },
  {
    id: 'range-jiuhuashan',
    name: '九华山山脉',
    category: 'range',
    description: '位于皖南池州，以九华山为核心，佛教文化与花岗岩地貌交融。',
    imageUrl: '',
  },
  {
    id: 'range-dabieshan',
    name: '大别山脉',
    category: 'range',
    description: '横跨皖西，主峰白马尖1777米，包括天堂寨、万佛山等，是华东最后一片原始森林所在地。',
    imageUrl: '',
  },
  {
    id: 'range-jianghuai',
    name: '江淮丘陵',
    category: 'range',
    description: '分布于安徽中部江淮之间，包括大蜀山、八公山、琅琊山等低山丘陵，兼具火山地貌与历史文化。',
    imageUrl: '',
  },

  // --- 生态系统 ---
  {
    id: 'ecology-forest',
    name: '森林生态',
    category: 'ecology',
    description: '安徽山脉森林覆盖率高达60%以上，黄山松、银杏、红豆杉等珍稀树种分布广泛，牯牛降被誉为"华东物种基因库"。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihrzlvqjq_ve_miaoda',
  },
  {
    id: 'ecology-species',
    name: '珍稀物种',
    category: 'ecology',
    description: '黄山短尾猴、白颈长尾雉、大鲵（娃娃鱼）、安徽麝等珍稀动物栖息于安徽各大山脉，构成丰富的生物多样性。',
    imageUrl: '',
  },

  // --- 文化遗产 ---
  {
    id: 'culture-poetry',
    name: '诗词文化',
    category: 'culture',
    description: '李白"相看两不厌，只有敬亭山"、欧阳修《醉翁亭记》、徐霞客黄山游记等千古名篇，赋予安徽山脉深厚的文化底蕴。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihprszmdi_ve_miaoda',
  },
  {
    id: 'culture-religion',
    name: '宗教文化',
    category: 'culture',
    description: '九华山为中国佛教四大名山之一（地藏菩萨道场），齐云山为中国四大道教名山之一，宗教文化与自然景观深度融合。',
    imageUrl: '',
  },
  {
    id: 'culture-history',
    name: '历史典故',
    category: 'culture',
    description: '八公山淝水之战古战场、皇藏峪汉高祖避难处、天柱山古南岳祭祀、浮山摩崖石刻等历史遗迹遍布安徽群山。',
    imageUrl: '',
  },

  // ============ 17座名山 ============
  {
    id: 'mountain-huangshan',
    name: '黄山',
    category: 'mountain',
    description: '世界文化与自然双遗产，以奇松、怪石、云海、温泉四绝著称，"五岳归来不看山，黄山归来不看岳"。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihx3tgsaq_ve_miaoda',
    elevation: 1864.8,
    location: '黄山市',
  },
  {
    id: 'mountain-jiuhuashan',
    name: '九华山',
    category: 'mountain',
    description: '中国佛教四大名山之一，地藏菩萨道场，花岗岩体经长期风化剥蚀形成奇秀景观。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Jiuhuashan%20Buddhist%20mountains%20with%20temples%2C%20misty%20morning%20light%2C%20warm%20grey%20and%20slate%20blue%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 1342,
    location: '池州市青阳县',
  },
  {
    id: 'mountain-tianzhushan',
    name: '天柱山',
    category: 'mountain',
    description: '世界地质公园，古称南岳，又名皖山（安徽简称"皖"来源），"东方最美的花岗岩景观"。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihsow4ugi_ve_miaoda',
    elevation: 1489.8,
    location: '安庆市潜山市',
  },
  {
    id: 'mountain-qiyunshan',
    name: '齐云山',
    category: 'mountain',
    description: '中国四大道教名山之一，"江南第一丹霞仙境"，白垩系红层形成的丹霞赤壁与紫霄崖。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Qiyunshan%20Danxia%20red%20cliff%20mountains%2C%20Daoist%20temples%2C%20misty%20atmosphere%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 585,
    location: '黄山市休宁县',
  },
  {
    id: 'mountain-dabieshan',
    name: '大别山白马尖',
    category: 'mountain',
    description: '大别山脉主峰，海拔1777米，原始森林茂密，生态环境极佳。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Dabie%20Mountains%20Baimajian%20peak%2C%20dense%20forest%2C%20misty%20valley%2C%20warm%20grey%20and%20green%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 1777,
    location: '六安市霍山县',
  },
  {
    id: 'mountain-guniujiang',
    name: '牯牛降',
    category: 'mountain',
    description: '"绿色自然博物馆"、"华东地区物种基因库"，花岗岩地貌与原始森林交相辉映。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Guniujiang%20primeval%20forest%2C%20granite%20peaks%2C%20lush%20vegetation%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 1727.6,
    location: '黄山市祁门县',
  },
  {
    id: 'mountain-jingtingshan',
    name: '敬亭山',
    category: 'mountain',
    description: '"诗山"，李白"相看两不厌，只有敬亭山"名句出处，文化底蕴深厚。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Jingtingshan%20poetic%20mountain%2C%20peaceful%20atmosphere%2C%20traditional%20Chinese%20painting%20style%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 317,
    location: '宣城市',
  },
  {
    id: 'mountain-langyashan',
    name: '琅琊山',
    category: 'mountain',
    description: '醉翁亭所在地，欧阳修《醉翁亭记》千古流传，"环滁皆山也"。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Langyashan%20ancient%20pavilion%20Zuiwengting%2C%20forest%20hills%2C%20traditional%20Chinese%20architecture%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 317,
    location: '滁州市',
  },
  {
    id: 'mountain-fushan',
    name: '浮山',
    category: 'mountain',
    description: '国家地质公园，保存完整的古火山地貌，"山浮水面"景观独特。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkih22rj4hi_ve_miaoda',
    elevation: 165,
    location: '铜陵市枞阳县',
  },
  {
    id: 'mountain-dashushan',
    name: '大蜀山',
    category: 'mountain',
    description: '合肥大蜀山森林公园，古火山遗迹，城市中的天然氧吧。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Dashushan%20ancient%20volcano%20near%20city%2C%20forest%20park%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 284,
    location: '合肥市',
  },
  {
    id: 'mountain-nvshan',
    name: '女山',
    category: 'mountain',
    description: '古火山口呈椭圆状，火山地貌保存完整，是研究火山地质的天然课堂。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Nvshan%20ancient%20volcanic%20crater%2C%20oval%20shape%2C%20geological%20features%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 101.5,
    location: '滁州市明光市',
  },
  {
    id: 'mountain-tiantangzhai',
    name: '天堂寨',
    category: 'mountain',
    description: '华东最后一片原始森林，瀑布群壮观，花岗岩地貌与原始生态完美结合。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Tiantangzhai%20waterfalls%20and%20primeval%20forest%2C%20spectacular%20scenery%2C%20warm%20grey%20and%20green%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 1729,
    location: '六安市金寨县',
  },
  {
    id: 'mountain-xiaogushan',
    name: '小孤山',
    category: 'mountain',
    description: '长江绝岛，"长江天柱"，楚蜀豫章诸水都会，屹立江心的独特山体。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Xiaogushan%20island%20in%20Yangtze%20River%2C%20unique%20peak%20standing%20in%20river%2C%20misty%20atmosphere%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 78,
    location: '安庆市宿松县',
  },
  {
    id: 'mountain-huangcangyu',
    name: '皇藏峪',
    category: 'mountain',
    description: '汉高祖刘邦避难处，瑞云寺古刹，天然次生林茂密。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Huangcangyu%20ancient%20temple%20and%20forest%2C%20historical%20site%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 389,
    location: '宿州市萧县',
  },
  {
    id: 'mountain-bagongshan',
    name: '八公山',
    category: 'mountain',
    description: '淝水之战古战场，豆腐发源地，"一人得道，鸡犬升天"典故出处。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Bagongshan%20ancient%20battlefield%2C%20historical%20mountains%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 241,
    location: '淮南市',
  },
  {
    id: 'mountain-qishan',
    name: '齐山',
    category: 'mountain',
    description: '岳飞屯兵处，齐山秋眺，岩溶地貌独特。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Qishan%20karst%20landform%2C%20autumn%20scenery%2C%20warm%20grey%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 87,
    location: '池州市',
  },
  {
    id: 'mountain-wanfoshan',
    name: '万佛山',
    category: 'mountain',
    description: '国家级自然保护区，原始森林与瀑布群交相辉映，生态价值极高。',
    imageUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chinese%20ink%20wash%20mountain%20landscape%2C%20Wanfoshan%20waterfalls%20and%20primeval%20forest%2C%20nature%20reserve%2C%20warm%20grey%20and%20green%20palette%2C%20rice%20paper%20texture&image_size=landscape_4_3',
    elevation: 1539,
    location: '六安市舒城县',
  },
];

// ============ 边关系数据 ============

export const ALL_EDGES: IKnowledgeEdge[] = [
  // 根节点 → 四大山系
  { source: 'root', target: 'range-huangshan', relation: '包含' },
  { source: 'root', target: 'range-jiuhuashan', relation: '包含' },
  { source: 'root', target: 'range-dabieshan', relation: '包含' },
  { source: 'root', target: 'range-jianghuai', relation: '包含' },

  // 根节点 → 三大地貌
  { source: 'root', target: 'landform-granite', relation: '地貌分类' },
  { source: 'root', target: 'landform-danxia', relation: '地貌分类' },
  { source: 'root', target: 'landform-volcanic', relation: '地貌分类' },

  // 根节点 → 生态文化
  { source: 'root', target: 'ecology-forest', relation: '生态系统' },
  { source: 'root', target: 'ecology-species', relation: '生态系统' },
  { source: 'root', target: 'culture-poetry', relation: '文化遗产' },
  { source: 'root', target: 'culture-religion', relation: '文化遗产' },
  { source: 'root', target: 'culture-history', relation: '文化遗产' },

  // 山系 → 山脉
  { source: 'range-huangshan', target: 'mountain-huangshan', relation: '包含' },
  { source: 'range-huangshan', target: 'mountain-qiyunshan', relation: '包含' },
  { source: 'range-huangshan', target: 'mountain-guniujiang', relation: '包含' },
  { source: 'range-jiuhuashan', target: 'mountain-jiuhuashan', relation: '包含' },
  { source: 'range-dabieshan', target: 'mountain-dabieshan', relation: '包含' },
  { source: 'range-dabieshan', target: 'mountain-tiantangzhai', relation: '包含' },
  { source: 'range-dabieshan', target: 'mountain-wanfoshan', relation: '包含' },
  { source: 'range-dabieshan', target: 'mountain-tianzhushan', relation: '包含' },
  { source: 'range-jianghuai', target: 'mountain-dashushan', relation: '包含' },
  { source: 'range-jianghuai', target: 'mountain-bagongshan', relation: '包含' },
  { source: 'range-jianghuai', target: 'mountain-langyashan', relation: '包含' },
  { source: 'range-jianghuai', target: 'mountain-nvshan', relation: '包含' },
  { source: 'range-jianghuai', target: 'mountain-huangcangyu', relation: '包含' },

  // 山脉 → 地貌类型
  { source: 'mountain-huangshan', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-jiuhuashan', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-tianzhushan', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-dabieshan', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-guniujiang', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-tiantangzhai', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-wanfoshan', target: 'landform-granite', relation: '属于' },
  { source: 'mountain-qiyunshan', target: 'landform-danxia', relation: '属于' },
  { source: 'mountain-fushan', target: 'landform-volcanic', relation: '属于' },
  { source: 'mountain-dashushan', target: 'landform-volcanic', relation: '属于' },
  { source: 'mountain-nvshan', target: 'landform-volcanic', relation: '属于' },

  // 山脉 → 文化关联
  { source: 'mountain-huangshan', target: 'culture-poetry', relation: '文化关联' },
  { source: 'mountain-jiuhuashan', target: 'culture-religion', relation: '文化关联' },
  { source: 'mountain-qiyunshan', target: 'culture-religion', relation: '文化关联' },
  { source: 'mountain-jingtingshan', target: 'culture-poetry', relation: '文化关联' },
  { source: 'mountain-langyashan', target: 'culture-poetry', relation: '文化关联' },
  { source: 'mountain-bagongshan', target: 'culture-history', relation: '文化关联' },
  { source: 'mountain-huangcangyu', target: 'culture-history', relation: '文化关联' },
  { source: 'mountain-tianzhushan', target: 'culture-history', relation: '文化关联' },
  { source: 'mountain-xiaogushan', target: 'culture-poetry', relation: '文化关联' },
  { source: 'mountain-qishan', target: 'culture-history', relation: '文化关联' },
  { source: 'mountain-fushan', target: 'culture-history', relation: '文化关联' },

  // 山脉 → 生态关联
  { source: 'mountain-huangshan', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-guniujiang', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-guniujiang', target: 'ecology-species', relation: '生态关联' },
  { source: 'mountain-tiantangzhai', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-wanfoshan', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-dabieshan', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-huangcangyu', target: 'ecology-forest', relation: '生态关联' },
  { source: 'mountain-dashushan', target: 'ecology-forest', relation: '生态关联' },
];

// ============ 视图配置 ============

export const VIEW_CONFIGS: IViewConfig[] = [
  {
    key: 'landform',
    label: '地貌视图',
    nodeFilter: (node) =>
      node.category === 'mountain' ||
      node.category === 'landform' ||
      node.id === 'root',
    edgeFilter: (edge) =>
      edge.relation === '属于' ||
      edge.relation === '地貌分类',
  },
  {
    key: 'range',
    label: '山系视图',
    nodeFilter: (node) =>
      node.category === 'mountain' ||
      node.category === 'range' ||
      node.id === 'root',
    edgeFilter: (edge) =>
      edge.relation === '包含',
  },
  {
    key: 'ecology',
    label: '生态视图',
    nodeFilter: (node) =>
      node.category === 'mountain' ||
      node.category === 'ecology' ||
      node.id === 'root',
    edgeFilter: (edge) =>
      edge.relation === '生态关联' ||
      edge.relation === '生态系统',
  },
  {
    key: 'culture',
    label: '文化视图',
    nodeFilter: (node) =>
      node.category === 'mountain' ||
      node.category === 'culture' ||
      node.id === 'root',
    edgeFilter: (edge) =>
      edge.relation === '文化关联' ||
      edge.relation === '文化遗产',
  },
];
