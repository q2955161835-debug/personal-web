import type {
  AnalysisCategory,
  AnalysisCategorySummary,
  AnalysisMethodNode,
  DataAnalysisProject,
} from "@/types";

export const analysisCategories: AnalysisCategory[] = [
  "问卷调查",
  "金融实证",
  "医学统计",
  "化学分析",
  "社会科学",
];

export const analysisProjects: DataAnalysisProject[] = [
  {
    id: "survey-consumption-logit",
    title: "大学生消费行为与支付偏好研究",
    category: "问卷调查",
    method: ["Logistic 回归", "信度效度检验", "交叉列联"],
    tools: ["SPSS", "Excel"],
    description: "基于结构化问卷识别消费频率、支付方式与价格敏感度之间的关系，输出可复核的统计报告。",
    year: 2025,
    highlights: [
      "模型显著识别高频消费人群的支付偏好差异",
      "Cronbach alpha 达到可接受水平",
      "将变量编码、假设检验与结论解释整理为交付模板",
    ],
  },
  {
    id: "finance-panel-esg",
    title: "ESG 表现对企业融资约束影响",
    category: "金融实证",
    method: ["面板双向固定效应", "稳健性检验", "中介效应"],
    tools: ["Python", "Stata"],
    description: "围绕上市公司面板数据构建双向固定效应模型，检验 ESG 与融资约束之间的因果关联。",
    year: 2025,
    highlights: [
      "控制行业与年度效应后核心变量仍保持显著",
      "替换被解释变量后结论方向一致",
      "输出可复跑的数据清洗与回归脚本",
    ],
  },
  {
    id: "medical-risk-model",
    title: "慢病风险因素筛查模型",
    category: "医学统计",
    method: ["多因素 Logistic 回归", "ROC 曲线", "列线图"],
    tools: ["R", "SPSS"],
    description: "面向医学观察数据构建风险因素筛查流程，评估变量贡献与模型区分能力。",
    year: 2024,
    highlights: [
      "AUC 达到可解释的临床辅助判断水平",
      "筛选出年龄、指标异常与生活习惯相关因素",
      "报告明确区分统计相关与临床解释边界",
    ],
  },
  {
    id: "chem-instrument-cluster",
    title: "化学仪器数据聚类与异常识别",
    category: "化学分析",
    method: ["K-means 聚类", "PCA 降维", "异常值检测"],
    tools: ["Python", "Excel"],
    description: "对仪器检测结果进行标准化、降维和聚类，辅助识别批次差异与异常样本。",
    year: 2025,
    highlights: [
      "PCA 前两主成分解释主要批次差异",
      "聚类结果与样本来源高度对应",
      "异常点复核建议直接写入交付报告",
    ],
  },
  {
    id: "social-satisfaction",
    title: "公共服务满意度驱动因素分析",
    category: "社会科学",
    method: ["有序 Logit", "因子分析", "灰色关联分析"],
    tools: ["SPSS", "R"],
    description: "对多维满意度问卷进行降维与模型解释，定位影响总体评价的关键因素。",
    year: 2024,
    highlights: [
      "服务响应、透明度和体验一致性贡献最高",
      "因子载荷结构清晰，便于业务解释",
      "输出分层改进建议而非单纯显著性列表",
    ],
  },
  {
    id: "garch-midas-finance",
    title: "宏观变量与波动率混频建模",
    category: "金融实证",
    method: ["GARCH-MIDAS", "ADF 检验", "样本外预测"],
    tools: ["Python", "R"],
    description: "使用低频宏观变量解释高频市场波动，完成混频建模、参数估计与预测评估。",
    year: 2025,
    highlights: [
      "宏观变量能解释部分长期波动成分",
      "样本外预测优于基础 GARCH 基准",
      "交付包含模型设定、诊断和复现实验记录",
    ],
  },
  {
    id: "survey-brand-segmentation",
    title: "品牌认知人群细分研究",
    category: "问卷调查",
    method: ["K-means 聚类", "卡方检验", "方差分析"],
    tools: ["SPSS", "Python"],
    description: "将问卷受访者按认知、购买意愿与价格偏好分群，生成可执行的人群画像。",
    year: 2025,
    highlights: [
      "识别出价格敏感、品质导向和高复购三类人群",
      "不同分群在购买频率上差异显著",
      "将统计结果转化为营销动作建议",
    ],
  },
  {
    id: "medical-survival",
    title: "治疗方案生存结局比较",
    category: "医学统计",
    method: ["Kaplan-Meier", "Cox 回归", "倾向得分匹配"],
    tools: ["R"],
    description: "针对回顾性医学数据评估治疗方案差异，并通过匹配降低基线不均衡影响。",
    year: 2024,
    highlights: [
      "匹配后组间关键协变量差异明显下降",
      "Cox 模型给出风险比与置信区间",
      "报告保留删失数据与样本限制说明",
    ],
  },
  {
    id: "social-policy-index",
    title: "区域发展指标综合评价",
    category: "社会科学",
    method: ["熵权法", "TOPSIS", "敏感性分析"],
    tools: ["Python", "Excel"],
    description: "构建多指标评价体系，对区域发展水平进行排序、分层与敏感性复核。",
    year: 2025,
    highlights: [
      "指标权重由数据离散度驱动，减少主观性",
      "排序结果经敏感性测试保持稳定",
      "图表化呈现区域短板和优先提升方向",
    ],
  },
];

export const analysisMethodNodes: AnalysisMethodNode[] = [
  { name: "Logistic 回归", count: 18, category: "问卷调查" },
  { name: "面板固定效应", count: 12, category: "金融实证" },
  { name: "K-means 聚类", count: 9, category: "化学分析" },
  { name: "GARCH-MIDAS", count: 5, category: "金融实证" },
  { name: "因子分析", count: 14, category: "社会科学" },
  { name: "Cox 回归", count: 6, category: "医学统计" },
  { name: "PCA", count: 8, category: "化学分析" },
  { name: "灰色关联分析", count: 7, category: "社会科学" },
];

export const analysisCategorySummary: AnalysisCategorySummary[] = [
  { category: "问卷调查", count: 27, color: "#49c5b6" },
  { category: "金融实证", count: 21, color: "#ff9398" },
  { category: "医学统计", count: 16, color: "#8b5cf6" },
  { category: "化学分析", count: 11, color: "#00d4ff" },
  { category: "社会科学", count: 18, color: "#a78bfa" },
];
