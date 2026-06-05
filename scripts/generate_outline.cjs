#!/usr/bin/env node
/**
 * 信息化解决方案目录大纲生成脚本
 * 基于用户需求自动生成多层级目录结构
 */

const STANDARD_OUTLINE = {
  chapters: [
    {
      id: 1,
      title: '项目概述',
      sections: [
        { id: 1.1, title: '项目背景' },
        { id: 1.2, title: '建设目标' },
        { id: 1.3, title: '建设范围' },
        { id: 1.4, title: '建设原则' },
        { id: 1.5, title: '术语定义' }
      ]
    },
    {
      id: 2,
      title: '需求分析',
      sections: [
        { id: 2.1, title: '业务需求分析' },
        { id: 2.2, title: '功能需求分析' },
        { id: 2.3, title: '非功能需求分析' },
        { id: 2.4, title: '用户需求分析' },
        { id: 2.5, title: '需求优先级矩阵' }
      ]
    },
    {
      id: 3,
      title: '总体设计',
      sections: [
        { id: 3.1, title: '总体架构设计' },
        { id: 3.2, title: '技术架构设计' },
        { id: 3.3, title: '技术选型方案' },
        { id: 3.4, title: '系统边界与接口' },
        { id: 3.5, title: '部署架构设计' }
      ]
    },
    {
      id: 4,
      title: '详细方案设计',
      sections: [
        { id: 4.1, title: '功能模块设计' },
        { id: 4.2, title: '数据库设计' },
        { id: 4.3, title: '接口设计' }
      ]
    },
    {
      id: 5,
      title: '实施计划',
      sections: [
        { id: 5.1, title: '项目实施策略' },
        { id: 5.2, title: '进度计划安排' },
        { id: 5.3, title: '资源配置计划' },
        { id: 5.4, title: '风险管理计划' }
      ]
    },
    {
      id: 6,
      title: '质量保障',
      sections: [
        { id: 6.1, title: '质量管理体系' },
        { id: 6.2, title: '测试策略与方案' },
        { id: 6.3, title: '验收标准' },
        { id: 6.4, title: '质量保证措施' },
        { id: 6.5, title: '持续改进机制' }
      ]
    },
    {
      id: 7,
      title: '运维与支持',
      sections: [
        { id: 7.1, title: '运维体系设计' },
        { id: 7.2, title: '技术支持方案' },
        { id: 7.3, title: '培训方案' },
        { id: 7.4, title: '应急预案' },
        { id: 7.5, title: '运维成本控制' }
      ]
    },
    {
      id: 8,
      title: '投资估算',
      sections: [
        { id: 8.1, title: '投资估算依据' },
        { id: 8.2, title: '软件投资估算' },
        { id: 8.3, title: '硬件投资估算' },
        { id: 8.4, title: '实施服务估算' },
        { id: 8.5, title: '运维成本估算' }
      ]
    }
  ]
};

/**
 * 根据需求信息定制目录大纲
 * @param {Object} requirements - 用户需求信息
 * @returns {Object} 定制化的目录结构
 */
function customizeOutline(requirements) {
  const outline = JSON.parse(JSON.stringify(STANDARD_OUTLINE));
  
  // 根据项目特点调整章节
  if (requirements) {
    // 根据技术复杂度调整详细设计章节
    if (requirements.technicalRequirements) {
      const techReqs = requirements.technicalRequirements;
      if (techReqs['系统架构偏好']?.includes('微服务')) {
        // 添加微服务相关章节
        outline.chapters[2].sections.push(
          { id: 3.6, title: '微服务治理方案' }
        );
      }
    }
    
    // 根据安全要求调整质量保障章节
    if (requirements.constraints) {
      const constraints = requirements.constraints;
      if (constraints['合规性要求']?.includes('等保')) {
        outline.chapters[5].sections.push(
          { id: 6.6, title: '安全等级保护方案' }
        );
      }
    }
  }
  
  return outline;
}

/**
 * 生成目录的 Markdown 格式输出
 * @param {Object} outline - 目录结构对象
 * @returns {string} Markdown 格式的目录
 */
function generateMarkdown(outline) {
  let markdown = '# 信息化解决方案目录大纲\n\n';
  
  outline.chapters.forEach(chapter => {
    markdown += `## 第${chapter.id}章 ${chapter.title}\n\n`;
    
    chapter.sections.forEach(section => {
      markdown += `### ${section.id} ${section.title}\n\n`;
    });
  });
  
  return markdown;
}

/**
 * 生成目录的 JSON 格式输出
 * @param {Object} outline - 目录结构对象
 * @returns {string} JSON 字符串
 */
function generateJSON(outline) {
  return JSON.stringify(outline, null, 2);
}

/**
 * 验证目录结构的完整性
 * @param {Object} outline - 目录结构对象
 * @returns {Object} 验证结果
 */
function validateOutline(outline) {
  const issues = [];
  
  // 检查必需章节
  const requiredChapters = ['项目概述', '需求分析', '总体设计', '详细方案设计', '实施计划'];
  const existingChapters = outline.chapters.map(c => c.title);
  
  requiredChapters.forEach(chapter => {
    if (!existingChapters.includes(chapter)) {
      issues.push(`缺少必需章节：${chapter}`);
    }
  });
  
  // 检查每个章节的子章节数量
  outline.chapters.forEach(chapter => {
    if (chapter.sections.length < 3) {
      issues.push(`第${chapter.id}章"${chapter.title}"子章节少于 3 个`);
    }
    if (chapter.sections.length > 10) {
      issues.push(`第${chapter.id}章"${chapter.title}"子章节超过 10 个，建议拆分`);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues: issues
  };
}

// 命令行交互功能
const readline = require('readline');

async function interactiveAdjustment(outline) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n=== 目录自定义调整 ===\n');
  console.log('可执行的操作：');
  console.log('[A] 添加章节  [D] 删除章节  [M] 修改名称');
  console.log('[R] 调整顺序  [C] 合并章节  [S] 拆分章节');
  console.log('[V] 预览目录  [U] 撤销操作  [Q] 完成调整\n');

  rl.question('请选择操作: ', (choice) => {
    // 简化的交互示例，实际使用可完善此逻辑
    console.log(`\n已选择操作：${choice}`);
    console.log('提示：完整交互逻辑可在 SKILL.md 中通过 AI 助手实现\n');
    rl.close();
  });
}

// 导出函数
module.exports = {
  STANDARD_OUTLINE,
  customizeOutline,
  generateMarkdown,
  generateJSON,
  validateOutline,
  interactiveAdjustment
};

// 如果直接运行此脚本
if (require.main === module) {
  console.log('标准目录大纲：');
  console.log(generateMarkdown(STANDARD_OUTLINE));
  
  const validation = validateOutline(STANDARD_OUTLINE);
  console.log('\n验证结果：', validation);
}
