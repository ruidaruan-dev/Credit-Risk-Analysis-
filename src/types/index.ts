// 企业数据类型
export interface Company {
  id: string;
  name: string;
  industry: string;
  registeredCapital: number; // 万元
  creditLimit: number; // 万元
  usedCredit: number; // 万元
  paymentTermDays: number;
  dueDate: string; // YYYY-MM-DD
  overdueCount: number;
  overdueDays: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

// 风险维度
export interface RiskDimensions {
  repaymentAbility: number; // 还款能力 (0-100)
  financialHealth: number; // 财务健康 (0-100)
  industryRisk: number; // 行业风险 (0-100)
  overdueHistory: number; // 逾期历史 (0-100)
  concentration: number; // 集中度 (0-100)
}

// 仪表盘统计
export interface DashboardStats {
  totalCompanies: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  totalCreditLimit: number;
  totalUsedCredit: number;
  overdueCompanies: number;
  averageRiskScore: number;
}

// 导入配置
export interface ImportConfig {
  nameField: string;
  industryField: string;
  registeredCapitalField: string;
  creditLimitField: string;
  usedCreditField: string;
  paymentTermDaysField: string;
  dueDateField: string;
  overdueCountField: string;
  overdueDaysField: string;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 编辑历史
export interface EditHistory {
  id: string;
  companyId: string;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}
