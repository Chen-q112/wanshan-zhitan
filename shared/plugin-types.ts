// ---- plugin:mountain_knowledge_qa_1 ----
// ============================================================
// 插件 mountain_knowledge_qa_1 (山脉知识问答) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface MountainKnowledgeQaOneInput {
  /** 用户关于安徽山脉的问题 */
  user_question: string;
}

/**
 * capabilityClient.load('mountain_knowledge_qa_1').call<MountainKnowledgeQaOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface MountainKnowledgeQaOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:mountain_knowledge_qa_1 ----

// ---- plugin:guide_speech_generation_1 ----
// ============================================================
// 插件 guide_speech_generation_1 (讲解词生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface GuideSpeechGenerationOneInput {
  /** 山峰名称 */
  mountain_name: string;
}

/**
 * capabilityClient.load('guide_speech_generation_1').call<GuideSpeechGenerationOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { response, content } = result;
 */
export interface GuideSpeechGenerationOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
}
// ---- end:guide_speech_generation_1 ----

// ---- plugin:study_tour_plan_generator_1 ----
// ============================================================
// 插件 study_tour_plan_generator_1 (研学方案生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface StudyTourPlanGeneratorOneInput {
  /** 研学天数 */
  days: string;
  /** 研学主题 */
  theme: string;
}

/**
 * capabilityClient.load('study_tour_plan_generator_1').call<StudyTourPlanGeneratorOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface StudyTourPlanGeneratorOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:study_tour_plan_generator_1 ----

// ---- plugin:popular_science_article_generate_1 ----
// ============================================================
// 插件 popular_science_article_generate_1 (科普短文生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface PopularScienceArticleGenerateOneInput {
  /** 科普短文的主题关键词 */
  topic_keywords: string;
}

/**
 * capabilityClient.load('popular_science_article_generate_1').call<PopularScienceArticleGenerateOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface PopularScienceArticleGenerateOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:popular_science_article_generate_1 ----

// ---- plugin:mountain_image_recognition_1 ----
// ============================================================
// 插件 mountain_image_recognition_1 (山峰图像识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface MountainImageRecognitionOneInput {
  /** 待识别的山峰图片 */
  mountain_images: string[];
  /** 用户补充的识别要求（可选） */
  additional_requirements?: string;
}

/**
 * capabilityClient.load('mountain_image_recognition_1').call<MountainImageRecognitionOneOutput>('imageUnderstanding', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { response, content, reasoningContent } = result;
 */
export interface MountainImageRecognitionOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
  /** [object Object] */
  reasoningContent?: string;
}
// ---- end:mountain_image_recognition_1 ----

// ---- plugin:quiz_question_generator_1 ----
// ============================================================
// 插件 quiz_question_generator_1 (测验题目生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface QuizQuestionGeneratorOneInput {
  /** 题目所属学科或主题领域，如：数学、语文、编程 */
  topic: string;
  /** 题目难度，如：简单、中等、困难 */
  difficulty: string;
  /** 生成题目数量，如：10道、20道 */
  quantity: string;
  /** 题目类型，如：选择题、判断题、填空题，可多选 */
  question_types: string;
}

/**
 * capabilityClient.load('quiz_question_generator_1').call<QuizQuestionGeneratorOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { response, content } = result;
 */
export interface QuizQuestionGeneratorOneOutput {
  /** [object Object] */
  response?: string;
  /** [object Object] */
  content: string;
}
// ---- end:quiz_question_generator_1 ----

// ---- plugin:answer_analysis_extension_1 ----
// ============================================================
// 插件 answer_analysis_extension_1 (答题解析与拓展) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface AnswerAnalysisExtensionOneInput {
  /** 用户答错的答案 */
  user_answer: string;
  /** 正确答案 */
  correct_answer: string;
  /** 题目所属学科/领域 */
  subject?: string;
  /** 题目内容 */
  question_content: string;
}

/**
 * capabilityClient.load('answer_analysis_extension_1').call<AnswerAnalysisExtensionOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface AnswerAnalysisExtensionOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:answer_analysis_extension_1 ----