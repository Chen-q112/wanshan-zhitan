// EXPORTS: IKnowledgeNode, IKnowledgeEdge, MOCK_KNOWLEDGE_NODES, MOCK_KNOWLEDGE_EDGES

export interface IKnowledgeNode {
  id: string
  name: string
  category: 'mountain' | 'landform' | 'range' | 'ecology' | 'culture'
  imageUrl: string
  description: string
}

export interface IKnowledgeEdge {
  source: string
  target: string
  relation: string
}

export const MOCK_KNOWLEDGE_NODES: IKnowledgeNode[] = [
  {
    id: 'root',
    name: '安徽山脉',
    category: 'range',
    imageUrl: '',
    description: '安徽省境内17座名山，涵盖三大地貌类型'
  },
  {
    id: 'huangshan',
    name: '黄山',
    category: 'mountain',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihx3tgsaq_ve_miaoda',
    description: '花岗岩峰林地貌，世界双遗产'
  },
  {
    id: 'tianzhushan',
    name: '天柱山',
    category: 'mountain',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihsow4ugi_ve_miaoda',
    description: '古南岳，安徽简称"皖"来源'
  }
]

export const MOCK_KNOWLEDGE_EDGES: IKnowledgeEdge[] = [
  { source: 'root', target: 'huangshan', relation: '包含' },
  { source: 'root', target: 'tianzhushan', relation: '包含' },
  { source: 'huangshan', target: 'tianzhushan', relation: '同属地貌' }
]