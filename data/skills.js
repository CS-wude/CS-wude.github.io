// Public metadata only. Update this file, then run npm test && npm run build.
export const SKILLS = [
  { id: 'wude-video-studio', name: 'Wude Video Studio', description: '把主题与学习资料制作成免费知识视频，串联课程设计、口播分镜、动画、配音字幕、质检交付与归档。附交付文件检查脚本。', category: '视频制作', author: 'WUDE', source: 'wude', url: 'https://github.com/CS-wude/skillhub/tree/main/skills/wude-video-studio', tags: ['wude-video-studio', '知识视频', '分镜', '免费工作流'] },
  { id: 'skill-creator', name: 'Skill Creator', description: '把一段工作方法整理成可复用的 Skill，并用评测、对比和迭代改进触发条件与效果。', category: '技能创作', author: 'Anthropic', source: 'external', url: 'https://github.com/anthropics/skills/tree/main/skills/skill-creator', tags: ['SKILL.md', '评测', '工作流'] },
  { id: 'frontend-design', name: 'Frontend Design', description: '围绕明确的视觉方向设计前端界面，兼顾排版、配色与页面表现，适合从想法走向可用页面。', category: '设计与前端', author: 'Anthropic', source: 'external', url: 'https://github.com/anthropics/skills/tree/main/skills/frontend-design', tags: ['UI', 'Web', '设计'] },
  { id: 'webapp-testing', name: 'Web App Testing', description: '使用 Playwright 检查本地 Web 应用，验证界面行为、截图和浏览器日志，帮助定位交互问题。', category: '开发与测试', author: 'Anthropic', source: 'external', url: 'https://github.com/anthropics/skills/tree/main/skills/webapp-testing', tags: ['Playwright', '测试', '浏览器'] },
  { id: 'pdf', name: 'PDF', description: '处理 PDF 文档的提取、合并、拆分与生成，按任务选择工具，保留可核对的文档结果。', category: '文档处理', author: 'Anthropic', source: 'external', url: 'https://github.com/anthropics/skills/tree/main/skills/pdf', tags: ['PDF', '文档', '提取'] },
];
export const CATEGORIES = [...new Set(SKILLS.map(skill => skill.category))];
export const HUB_URL = 'https://github.com/CS-wude/skillhub';
