#!/usr/bin/env node
/**
 * 信息化解决方案需求信息采集脚本
 * 用于引导用户提供项目的核心信息
 */

const readline = require('readline');

const REQUIREMENTS_TEMPLATE = {
  projectBackground: {
    title: '项目背景',
    questions: [
      '项目所属行业及行业现状',
      '项目建设政策依据或业务驱动因素',
      '当前面临的痛点或挑战',
      '项目建设的必要性'
    ]
  },
  targetUsers: {
    title: '目标用户',
    questions: [
      '主要用户群体及角色',
      '用户规模预估',
      '用户使用场景',
      '特殊用户群体需求'
    ]
  },
  businessRequirements: {
    title: '核心业务需求',
    questions: [
      '主要业务流程',
      '关键业务功能',
      '业务数据处理需求',
      '与其他系统的业务协同'
    ]
  },
  technicalRequirements: {
    title: '技术要求',
    questions: [
      '系统架构偏好（如微服务、单体等）',
      '技术栈要求或限制',
      '性能指标（并发量、响应时间等）',
      '安全性要求',
      '可扩展性要求'
    ]
  },
  budget: {
    title: '预算范围',
    questions: [
      '项目总投资预算',
      '软件采购预算',
      '硬件及基础设施预算',
      '运维预算'
    ]
  },
  timeline: {
    title: '实施周期',
    questions: [
      '项目期望启动时间',
      '关键时间节点要求',
      '项目总周期',
      '分期建设计划（如有）'
    ]
  },
  constraints: {
    title: '特殊约束条件',
    questions: [
      '合规性要求（如等保、行业规范）',
      '技术限制条件',
      '资源约束',
      '其他特殊要求'
    ]
  }
};

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });
}

function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function collectRequirements() {
  const rl = createInterface();
  const collectedData = {};

  console.log('\n========================================');
  console.log('  信息化解决方案需求信息采集');
  console.log('========================================\n');

  try {
    for (const [category, config] of Object.entries(REQUIREMENTS_TEMPLATE)) {
      console.log(`\n【${config.title}】\n`);
      collectedData[category] = {};

      for (const question of config.questions) {
        const answer = await askQuestion(rl, `${question}: `);
        if (answer && answer.trim()) {
          collectedData[category][question] = answer.trim();
        }
      }
    }

    console.log('\n========================================');
    console.log('  需求信息采集完成');
    console.log('========================================\n');

    console.log(JSON.stringify(collectedData, null, 2));
    
    return collectedData;
  } catch (error) {
    console.error('采集过程出错:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  collectRequirements();
}

module.exports = { collectRequirements, REQUIREMENTS_TEMPLATE };
