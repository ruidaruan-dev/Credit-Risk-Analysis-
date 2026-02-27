import type { Company, RiskDimensions } from '../types';

// 行业风险等级映射
const INDUSTRY_RISK_MAP: Record<string, number> = {
  '房地产': 75,
  '建筑': 70,
  '采矿': 65,
  '制造': 40,
  '零售': 45,
  '批发': 40,
  '物流': 50,
  '运输': 55,
  '科技': 30,
  '互联网': 25,
  '金融': 60,
  '教育': 35,
  '医疗': 35,
  '农业': 60,
  '能源': 65,
  '化工': 70,
  '电子': 35,
  '机械': 40,
  '纺织': 50,
  '食品': 40,
};

/**
 * 计算风险维度
 */
export function calculateRiskDimensions(company: Partial<Company>): RiskDimensions {
  const {
    creditLimit = 1000,
    usedCredit = 500,
    registeredCapital = 2000,
    overdueCount = 0,
    overdueDays = 0,
    industry = '其他',
  } = company;

  // 1. 还款能力 (25%) - 基于资本充足率
  const capitalRatio = registeredCapital / creditLimit;
  const repaymentAbility = Math.min(100, Math.max(0, capitalRatio * 50));

  // 2. 财务健康 (20%) - 基于授信使用率
  const utilizationRate = usedCredit / creditLimit;
  let financialHealth = 100;
  if (utilizationRate > 0.9) financialHealth = 20;
  else if (utilizationRate > 0.8) financialHealth = 35;
  else if (utilizationRate > 0.7) financialHealth = 50;
  else if (utilizationRate > 0.6) financialHealth = 65;
  else if (utilizationRate > 0.5) financialHealth = 75;
  else if (utilizationRate > 0.3) financialHealth = 85;
  else financialHealth = 95;

  // 3. 行业风险 (20%) - 预定义的行业风险等级
  const industryRisk = INDUSTRY_RISK_MAP[industry] || 50;

  // 4. 逾期历史 (25%) - 基于逾期次数和天数
  let overdueHistory = 0;
  if (overdueCount === 0) {
    overdueHistory = 0;
  } else if (overdueDays === 0) {
    overdueHistory = Math.min(100, overdueCount * 10);
  } else {
    overdueHistory = Math.min(100, overdueCount * 15 + Math.min(50, overdueDays / 2));
  }

  // 5. 集中度 (10%) - 单个企业授信占比（这里简化处理，实际应该计算占总额的比例）
  const concentration = Math.min(100, (creditLimit / 10000) * 10);

  return {
    repaymentAbility,
    financialHealth,
    industryRisk,
    overdueHistory,
    concentration,
  };
}

/**
 * 计算综合风险评分
 */
export function calculateRiskScore(dimensions: RiskDimensions): number {
  const weights = {
    repaymentAbility: 0.25,
    financialHealth: 0.2,
    industryRisk: 0.2,
    overdueHistory: 0.25,
    concentration: 0.1,
  };

  const score =
    dimensions.repaymentAbility * weights.repaymentAbility +
    (100 - dimensions.financialHealth) * weights.financialHealth +
    dimensions.industryRisk * weights.industryRisk +
    dimensions.overdueHistory * weights.overdueHistory +
    dimensions.concentration * weights.concentration;

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * 根据评分获取风险等级
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 65) return 'high';
  if (score >= 35) return 'medium';
  return 'low';
}

/**
 * 生成风险因素列表
 */
export function generateRiskFactors(
  company: Partial<Company>,
  dimensions: RiskDimensions
): Array<{ factor: string; severity: 'low' | 'medium' | 'high'; description: string }> {
  const factors: Array<{ factor: string; severity: 'low' | 'medium' | 'high'; description: string }> = [];

  const { usedCredit = 0, creditLimit = 1000, overdueCount = 0, overdueDays = 0 } = company;
  const utilizationRate = usedCredit / creditLimit;

  // 还款能力风险
  if (dimensions.repaymentAbility < 30) {
    factors.push({
      factor: '资本充足率低',
      severity: 'high',
      description: '企业注册资本相对授信额度较低，还款能力有限',
    });
  } else if (dimensions.repaymentAbility < 50) {
    factors.push({
      factor: '资本充足率一般',
      severity: 'medium',
      description: '企业资本充足率处于中等水平',
    });
  }

  // 财务健康风险
  if (utilizationRate > 0.8) {
    factors.push({
      factor: '授信使用率过高',
      severity: 'high',
      description: `授信使用率达到 ${(utilizationRate * 100).toFixed(1)}%，资金压力大`,
    });
  } else if (utilizationRate > 0.6) {
    factors.push({
      factor: '授信使用率较高',
      severity: 'medium',
      description: `授信使用率为 ${(utilizationRate * 100).toFixed(1)}%`,
    });
  }

  // 逾期风险
  if (overdueCount > 0) {
    factors.push({
      factor: '有逾期记录',
      severity: overdueCount > 2 ? 'high' : 'medium',
      description: `过去有 ${overdueCount} 次逾期记录，最长逾期 ${overdueDays} 天`,
    });
  }

  // 行业风险
  if (dimensions.industryRisk > 65) {
    factors.push({
      factor: '行业风险高',
      severity: 'high',
      description: '所属行业风险等级较高，需要重点关注',
    });
  } else if (dimensions.industryRisk > 50) {
    factors.push({
      factor: '行业风险中等',
      severity: 'medium',
      description: '所属行业风险等级处于中等水平',
    });
  }

  // 集中度风险
  if (dimensions.concentration > 50) {
    factors.push({
      factor: '单户集中度高',
      severity: 'medium',
      description: '该企业授信额度占比较大，风险集中',
    });
  }

  // 如果没有风险因素，添加正面评价
  if (factors.length === 0) {
    factors.push({
      factor: '风险因素少',
      severity: 'low',
      description: '该企业各项指标均处于良好水平，风险可控',
    });
  }

  return factors;
}

/**
 * 计算仪表盘统计数据
 */
export function calculateDashboardStats(companies: Company[]) {
  const stats = {
    totalCompanies: companies.length,
    highRiskCount: 0,
    mediumRiskCount: 0,
    lowRiskCount: 0,
    totalCreditLimit: 0,
    totalUsedCredit: 0,
    overdueCompanies: 0,
    averageRiskScore: 0,
  };

  if (companies.length === 0) return stats;

  let totalScore = 0;

  companies.forEach((company) => {
    // 风险等级统计
    if (company.riskLevel === 'high') stats.highRiskCount++;
    else if (company.riskLevel === 'medium') stats.mediumRiskCount++;
    else stats.lowRiskCount++;

    // 授信统计
    stats.totalCreditLimit += company.creditLimit;
    stats.totalUsedCredit += company.usedCredit;

    // 逾期统计
    if (company.overdueDays > 0) stats.overdueCompanies++;

    // 评分统计
    totalScore += company.riskScore;
  });

  stats.averageRiskScore = Math.round(totalScore / companies.length);

  return stats;
}
