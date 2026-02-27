import Papa from 'papaparse';
import type { Company, ImportConfig } from '../types';
import { calculateRiskDimensions, calculateRiskScore, getRiskLevel } from './riskEngine';

/**
 * 解析 CSV 文件
 */
export function parseCSV(file: File): Promise<Record<string, any>[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as Record<string, any>[]);
      },
      error: (error) => {
        reject(new Error(`CSV 解析失败: ${error.message}`));
      },
    });
  });
}

/**
 * 将导入的数据转换为 Company 对象
 */
export function convertToCompany(
  row: Record<string, any>,
  config: ImportConfig,
  index: number
): Company | null {
  try {
    const name = String(row[config.nameField] || '').trim();
    const industry = String(row[config.industryField] || '其他').trim();
    const registeredCapital = parseNumber(row[config.registeredCapitalField]);
    const creditLimit = parseNumber(row[config.creditLimitField]);
    const usedCredit = parseNumber(row[config.usedCreditField]);
    const paymentTermDays = parseNumber(row[config.paymentTermDaysField]);
    const dueDate = parseDateString(row[config.dueDateField]);
    const overdueCount = parseNumber(row[config.overdueCountField]);
    const overdueDays = parseNumber(row[config.overdueDaysField]);

    // 验证必填字段
    if (!name || creditLimit <= 0) {
      return null;
    }

    // 计算风险评分
    const dimensions = calculateRiskDimensions({
      creditLimit,
      usedCredit,
      registeredCapital,
      paymentTermDays,
      overdueCount,
      overdueDays,
      industry,
    });

    const riskScore = calculateRiskScore(dimensions);
    const riskLevel = getRiskLevel(riskScore);

    const now = new Date().toISOString();

    return {
      id: `company_${Date.now()}_${index}`,
      name,
      industry,
      registeredCapital,
      creditLimit,
      usedCredit,
      paymentTermDays,
      dueDate,
      overdueCount,
      overdueDays,
      riskScore,
      riskLevel,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error(`转换第 ${index + 1} 行数据失败:`, error);
    return null;
  }
}

/**
 * 解析数字字符串
 */
function parseNumber(value: any): number {
  if (value === null || value === undefined || value === '') return 0;
  const str = String(value).trim().replace(/,/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

/**
 * 解析日期字符串
 */
function parseDateString(value: any): string {
  if (!value) {
    const date = new Date();
    date.setDate(date.getDate() + 90);
    return date.toISOString().split('T')[0];
  }

  const str = String(value).trim();

  // 尝试解析 YYYY-MM-DD 格式
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 尝试解析 YYYY/MM/DD 格式
  if (/^\d{4}\/\d{2}\/\d{2}$/.test(str)) {
    return str.replace(/\//g, '-');
  }

  // 尝试解析 MM/DD/YYYY 格式
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    const [month, day, year] = str.split('/');
    return `${year}-${month}-${day}`;
  }

  // 默认返回 90 天后的日期
  const date = new Date();
  date.setDate(date.getDate() + 90);
  return date.toISOString().split('T')[0];
}

/**
 * 自动检测 CSV 列
 */
export function detectColumns(headers: string[]): Partial<ImportConfig> {
  const config: Partial<ImportConfig> = {};

  const namePatterns = ['企业名称', '公司名称', '名称', 'name', 'company'];
  const industryPatterns = ['行业', 'industry', '所属行业'];
  const capitalPatterns = ['注册资本', '资本', 'capital', 'registered'];
  const creditPatterns = ['授信额度', '授信', 'credit', 'limit'];
  const usedPatterns = ['已用额度', '已用', 'used'];
  const termPatterns = ['账期天数', '账期', '天数', 'days', 'term'];
  const datePatterns = ['到期日', '到期日期', 'due', 'duedate'];
  const overdueCountPatterns = ['逾期次数', '逾期', 'overdue', 'count'];
  const overdueDaysPatterns = ['最长逾期天数', '逾期天数', 'overdue_days'];

  headers.forEach((header) => {
    const lower = header.toLowerCase();
    if (!config.nameField && namePatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.nameField = header;
    }
    if (!config.industryField && industryPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.industryField = header;
    }
    if (!config.registeredCapitalField && capitalPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.registeredCapitalField = header;
    }
    if (!config.creditLimitField && creditPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.creditLimitField = header;
    }
    if (!config.usedCreditField && usedPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.usedCreditField = header;
    }
    if (!config.paymentTermDaysField && termPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.paymentTermDaysField = header;
    }
    if (!config.dueDateField && datePatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.dueDateField = header;
    }
    if (!config.overdueCountField && overdueCountPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.overdueCountField = header;
    }
    if (!config.overdueDaysField && overdueDaysPatterns.some((p) => lower.includes(p.toLowerCase()))) {
      config.overdueDaysField = header;
    }
  });

  return config;
}

/**
 * 生成示例 CSV 内容
 */
export function generateSampleCSV(): string {
  const headers = [
    '企业名称',
    '行业',
    '注册资本',
    '授信额度',
    '已用额度',
    '账期天数',
    '到期日',
    '逾期次数',
    '最长逾期天数',
  ];

  const samples = [
    ['北京科技有限公司', '科技', '5000', '1000', '600', '60', '2026-06-30', '0', '0'],
    ['上海制造股份公司', '制造', '8000', '2000', '1200', '90', '2026-07-15', '1', '5'],
    ['深圳互联网公司', '互联网', '3000', '800', '400', '45', '2026-05-20', '0', '0'],
    ['广州贸易有限公司', '批发', '4000', '1500', '1200', '75', '2026-08-01', '2', '15'],
    ['杭州房产开发公司', '房地产', '10000', '5000', '3500', '120', '2026-09-30', '0', '0'],
  ];

  const rows = [headers, ...samples];
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
}
