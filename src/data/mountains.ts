// EXPORTS: IMountain, MOCK_MOUNTAINS
export interface IMountain {
  id: string
  name: string
  location: string
  elevation: number
  landformType: 'granite' | 'danxia' | 'volcanic' | 'other'
  description: string
  highlights: string[]
  geology: string
  imageUrl: string
}

export const MOCK_MOUNTAINS: IMountain[] = [
  {
    id: '1',
    name: '黄山',
    location: '黄山市',
    elevation: 1864.8,
    landformType: 'granite',
    description: '世界文化与自然双遗产，以奇松、怪石、云海、温泉四绝著称。',
    highlights: ['莲花峰', '光明顶', '天都峰', '迎客松'],
    geology: '燕山期花岗岩，垂直节理发育，八亿年地质史。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihx3tgsaq_ve_miaoda'
  },
  {
    id: '2',
    name: '天柱山',
    location: '安庆市潜山市',
    elevation: 1489.8,
    landformType: 'granite',
    description: '世界地质公园，古称南岳，安徽简称“皖”的来源。',
    highlights: ['天柱峰', '炼丹湖', '神秘谷'],
    geology: '“东方最美花岗岩景观”，千米以上山峰45座。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkihsow4ugi_ve_miaoda'
  },
  {
    id: '3',
    name: '浮山',
    location: '铜陵市枞阳县',
    elevation: 165,
    landformType: 'volcanic',
    description: '国家地质公园，保存完整的古火山地貌。',
    highlights: ['火山口', '熔岩台地', '山浮水面'],
    geology: '古火山喷发形成，火山弹与柱状节理发育。',
    imageUrl: '/spark/app/app_1794be9t6h2/runtime/api/v1/storage/object/bucket_aadkiicxch6do_static/static%2Faadkih22rj4hi_ve_miaoda'
  }
]