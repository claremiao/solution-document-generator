#!/usr/bin/env node
/**
 * 信息化解决方案内容质量检查脚本
 * 用于验证生成内容的质量和完整性
 */

/**
 * 内容质量检查项定义
 */
const QUALITY_CHECKS = {
  // 字数检查
  wordCount: {
    name: '字数检查',
    minWordsPerSection: 300,
    maxWordsPerSection: 500,
    minWordsPerChapter: 2000,
    description: '每个子章节 300-500 字，每个章节目录下都要至少有一段内容'
  },
  
  // 结构完整性检查
  structureCompleteness: {
    name: '结构完整性',
    requiredSections: ['项目概述', '需求分析', '总体设计', '详细方案设计', '实施计划'],
    description: '检查必需章节是否完整，子章节数量合理（3-8个），深度（3-5层）'
  },
  
  // 内容深度检查
  contentDepth: {
    name: '内容深度',
    requiredElements: [
      '数据支撑',
      '技术方案',
      '实施步骤',
      '风险分析'
    ],
    description: '检查关键内容要素是否充分'
  },
  
  // 逻辑一致性检查
  logicConsistency: {
    name: '逻辑一致性',
    checks: [
      '目标与需求对应',
      '方案与目标匹配',
      '计划与方案一致',
      '预算与规模匹配'
    ],
    description: '检查内容逻辑是否一致'
  },
  
  // 专业性检查
  professionalism: {
    name: '专业性',
    aspects: [
      '术语使用准确',
      '标准规范引用',
      '行业最佳实践',
      '技术方案可行'
    ],
    description: '检查内容是否符合专业标准'
  },
  
  // 可操作性检查
  operability: {
    name: '可操作性',
    criteria: [
      '实施步骤具体',
      '时间节点明确',
      '责任分工清晰',
      '资源配置充分'
    ],
    description: '检查方案是否可落地实施'
  }
};

/**
 * 检查章节字数
 * @param {string} content - 章节内容
 * @param {string} sectionTitle - 章节标题
 * @returns {Object} 检查结果
 */
function checkWordCount(content, sectionTitle) {
  // 中文字数统计（按字符数计算）
  const wordCount = content.length;
  const minWords = QUALITY_CHECKS.wordCount.minWordsPerSection;
  const maxWords = QUALITY_CHECKS.wordCount.maxWordsPerSection;

  let passed = true;
  let message = '';

  if (wordCount < minWords) {
    passed = false;
    message = `✗ ${sectionTitle}: ${wordCount}字（少于${minWords}字最低要求）`;
  } else if (wordCount > maxWords && maxWords > 0) {
    // maxWordsPerSection 为 0 时表示不限制上限
    passed = true; // 超过上限只是提醒，不算不通过
    message = `⚠ ${sectionTitle}: ${wordCount}字（超过建议上限${maxWords}字，请检查是否过于冗长）`;
  } else {
    message = `✓ ${sectionTitle}: ${wordCount}字（符合要求）`;
  }

  return {
    section: sectionTitle,
    wordCount: wordCount,
    passed: passed,
    message: message
  };
}

/**
 * 检查必需章节
 * @param {Array} chapters - 章节列表
 * @returns {Object} 检查结果
 */
function checkRequiredChapters(chapters) {
  const chapterTitles = chapters.map(c => c.title);
  const required = QUALITY_CHECKS.structureCompleteness.requiredSections;
  const missing = required.filter(title => !chapterTitles.includes(title));
  
  return {
    passed: missing.length === 0,
    missingChapters: missing,
    message: missing.length === 0
      ? '✓ 必需章节完整'
      : `✗ 缺少必需章节：${missing.join('、')}`
  };
}

/**
 * 检查内容要素
 * @param {string} content - 内容文本
 * @param {string} elementType - 要素类型
 * @returns {Object} 检查结果
 */
function checkContentElement(content, elementType) {
  const indicators = {
    '数据支撑': ['%', '达到', '提升', '降低', '亿元', '万元', '个', '倍'],
    '技术方案': ['架构', '技术', '平台', '系统', '模块', '接口'],
    '实施步骤': ['阶段', '步骤', '任务', '完成', '交付'],
    '风险分析': ['风险', '应对', '措施', '预案', '控制']
  };
  
  const keywords = indicators[elementType] || [];
  const matchCount = keywords.reduce((count, keyword) => {
    return count + (content.includes(keyword) ? 1 : 0);
  }, 0);
  
  const passed = matchCount >= 2; // 至少包含 2 个相关关键词
  
  return {
    element: elementType,
    passed: passed,
    matchCount: matchCount,
    message: passed 
      ? `✓ 包含${elementType}内容`
      : `✗ ${elementType}内容不足`
  };
}

/**
 * 检查章节深度（支持3-5层嵌套）
 * @param {Object} document - 文档结构对象
 * @returns {Object} 检查结果
 */
function checkChapterDepth(document) {
  const issues = [];

  // 递归计算最大深度
  function getMaxDepth(sections, currentDepth) {
    if (!sections || sections.length === 0) return currentDepth;
    let maxDepth = currentDepth;
    sections.forEach(section => {
      if (section.sections && section.sections.length > 0) {
        const depth = getMaxDepth(section.sections, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    });
    return maxDepth;
  }

  const chapters = document.chapters || [];
  chapters.forEach(chapter => {
    const depth = getMaxDepth(chapter.sections || [], 2); // 章=1, 节=2
    if (depth > 5) {
      issues.push(`第${chapter.id}章"${chapter.title}"深度为${depth}层，超过建议的5层上限`);
    }
  });

  return {
    passed: issues.length === 0,
    issues: issues,
    message: issues.length === 0
      ? '✓ 章节深度检查通过（3-5层范围内）'
      : `✗ 发现${issues.length}个深度问题`
  };
}

/**
 * 检查每个章节目录下是否都有内容
 * @param {Object} document - 文档结构对象
 * @returns {Object} 检查结果
 */
function checkContentExistence(document) {
  const chapters = document.chapters || [];
  const content = document.content || {};
  const emptySections = [];

  chapters.forEach(chapter => {
    const sections = chapter.sections || [];
    sections.forEach(section => {
      const sectionKey = section.id;
      const sectionContent = content[sectionKey];
      if (!sectionContent || sectionContent.trim().length === 0) {
        emptySections.push(`${section.id} ${section.title}`);
      }
      // 递归检查子章节
      if (section.sections) {
        section.sections.forEach(subSection => {
          const subKey = subSection.id;
          const subContent = content[subKey];
          if (!subContent || subContent.trim().length === 0) {
            emptySections.push(`${subSection.id} ${subSection.title}`);
          }
        });
      }
    });
  });

  return {
    passed: emptySections.length === 0,
    emptySections: emptySections,
    message: emptySections.length === 0
      ? '✓ 所有章节目录下都有内容'
      : `✗ 以下章节缺少内容：${emptySections.join('、')}`
  };
}

/**
 * 检查逻辑一致性
 * @param {Object} document - 文档结构对象
 * @returns {Object} 检查结果
 */
function checkLogicConsistency(document) {
  const issues = [];
  
  // 简化版检查：验证章节编号连续性
  const chapters = document.chapters || [];
  for (let i = 0; i < chapters.length; i++) {
    if (chapters[i].id !== i + 1) {
      issues.push(`第${i + 1}章编号错误，应为${i + 1}，实际为${chapters[i].id}`);
    }
    
    // 检查子章节编号
    const sections = chapters[i].sections || [];
    for (let j = 0; j < sections.length; j++) {
      const expectedId = `${i + 1}.${j + 1}`;
      if (sections[j].id.toString() !== expectedId) {
        issues.push(`子章节${sections[j].id}编号错误，应为${expectedId}`);
      }
    }
  }
  
  return {
    passed: issues.length === 0,
    issues: issues,
    message: issues.length === 0
      ? '✓ 逻辑一致性检查通过'
      : `✗ 发现${issues.length}个一致性问题`
  };
}

/**
 * 执行完整的质量检查
 * @param {Object} document - 完整的文档结构
 * @returns {Object} 质量检查报告
 */
function performQualityCheck(document) {
  const report = {
    timestamp: new Date().toISOString(),
    overallPassed: true,
    checks: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  };
  
  // 1. 必需章节检查
  const chapterCheck = checkRequiredChapters(document.chapters);
  report.checks.push(chapterCheck);
  report.summary.total++;
  if (chapterCheck.passed) report.summary.passed++;
  else report.summary.failed++;
  report.overallPassed = report.overallPassed && chapterCheck.passed;

  // 2. 章节深度检查
  const depthCheck = checkChapterDepth(document);
  report.checks.push(depthCheck);
  report.summary.total++;
  if (depthCheck.passed) report.summary.passed++;
  else report.summary.failed++;
  report.overallPassed = report.overallPassed && depthCheck.passed;

  // 3. 内容存在性检查
  const contentExistCheck = checkContentExistence(document);
  report.checks.push(contentExistCheck);
  report.summary.total++;
  if (contentExistCheck.passed) report.summary.passed++;
  else report.summary.failed++;
  report.overallPassed = report.overallPassed && contentExistCheck.passed;

  // 4. 逻辑一致性检查
  const logicCheck = checkLogicConsistency(document);
  report.checks.push(logicCheck);
  report.summary.total++;
  if (logicCheck.passed) report.summary.passed++;
  else report.summary.failed++;
  report.overallPassed = report.overallPassed && logicCheck.passed;

  // 5. 字数检查（示例检查第一个章节的第一个子章节）
  if (document.content && document.chapters.length > 0) {
    const firstChapter = document.chapters[0];
    if (firstChapter.sections && firstChapter.sections.length > 0) {
      const sampleContent = document.content[firstChapter.id] || '';
      const wordCheck = checkWordCount(sampleContent, firstChapter.title);
      report.checks.push(wordCheck);
      report.summary.total++;
      if (wordCheck.passed) report.summary.passed++;
      else report.summary.failed++;
      report.overallPassed = report.overallPassed && wordCheck.passed;
    }
  }

  return report;
}

/**
 * 生成质量检查报告（文本格式）
 * @param {Object} report - 质量检查报告
 * @returns {string} 格式化的报告文本
 */
function generateReportText(report) {
  let output = '\n========================================\n';
  output += '  信息化解决方案质量检查报告\n';
  output += '========================================\n';
  output += `检查时间：${report.timestamp}\n\n`;
  
  output += '检查结果：\n';
  output += '----------------------------------------\n';
  
  report.checks.forEach((check, index) => {
    output += `${index + 1}. ${check.message}\n`;
  });
  
  output += '\n----------------------------------------\n';
  output += `总计：${report.summary.total}项检查，`;
  output += `通过${report.summary.passed}项，`;
  output += `未通过${report.summary.failed}项\n`;
  output += `整体结果：${report.overallPassed ? '✓ 通过' : '✗ 未通过'}\n`;
  output += '========================================\n';
  
  return output;
}

/**
 * 生成改进建议
 * @param {Object} report - 质量检查报告
 * @returns {Array} 改进建议列表
 */
function generateSuggestions(report) {
  const suggestions = [];
  
  report.checks.forEach(check => {
    if (!check.passed) {
      if (check.missingChapters) {
        suggestions.push(`建议补充缺失章节：${check.missingChapters.join('、')}`);
      }
      if (check.issues) {
        suggestions.push(`建议修复一致性问题：${check.issues.join('；')}`);
      }
      if (check.wordCount !== undefined && check.wordCount < QUALITY_CHECKS.wordCount.minWordsPerSection) {
        suggestions.push(`建议扩充内容至 ${QUALITY_CHECKS.wordCount.minWordsPerSection} 字以上（当前：${check.wordCount}字）`);
      }
    }
  });
  
  if (suggestions.length === 0) {
    suggestions.push('内容质量良好，无需特别改进');
  }
  
  return suggestions;
}

// 导出函数
module.exports = {
  QUALITY_CHECKS,
  checkWordCount,
  checkRequiredChapters,
  checkContentElement,
  checkChapterDepth,
  checkContentExistence,
  checkLogicConsistency,
  performQualityCheck,
  generateReportText,
  generateSuggestions
};

// 如果直接运行此脚本
if (require.main === module) {
  // 示例测试
  const testDocument = {
    chapters: [
      { id: 1, title: '项目概述', sections: [{ id: 1.1, title: '项目背景' }] },
      { id: 2, title: '需求分析', sections: [{ id: 2.1, title: '业务需求' }] },
      { id: 3, title: '总体设计', sections: [{ id: 3.1, title: '架构设计' }] },
      { id: 4, title: '详细设计', sections: [{ id: 4.1, title: '模块设计' }] },
      { id: 5, title: '实施计划', sections: [{ id: 5.1, title: '进度计划' }] }
    ],
    content: {
      1: '示例内容...'.repeat(100)
    }
  };
  
  const report = performQualityCheck(testDocument);
  console.log(generateReportText(report));
  
  const suggestions = generateSuggestions(report);
  console.log('\n改进建议：');
  suggestions.forEach((s, i) => console.log(`${i + 1}. ${s}`));
}
