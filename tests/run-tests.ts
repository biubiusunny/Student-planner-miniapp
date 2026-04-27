/**
 * 测试运行器
 * 执行单元测试和集成测试
 */

import { runAllTests } from './unit.test'
import { runIntegrationTests } from './integration.test'

/**
 * 主测试函数
 */
function runTests() {
  console.log('\n🧪 ====================================')
  console.log('🧪  大学生规划小程序 - 测试套件')
  console.log('🧪 ====================================\n')

  let unitTestsPassed = false
  let integrationTestsPassed = false

  // 运行单元测试
  try {
    unitTestsPassed = runAllTests()
  } catch (error) {
    console.error('单元测试运行失败:', error)
  }

  // 运行集成测试
  try {
    integrationTestsPassed = runIntegrationTests()
  } catch (error) {
    console.error('集成测试运行失败:', error)
  }

  // 输出总结
  console.log('\n📊 测试总结')
  console.log('================')
  console.log(`单元测试: ${unitTestsPassed ? '✅ 通过' : '❌ 失败'}`)
  console.log(`集成测试: ${integrationTestsPassed ? '✅ 通过' : '❌ 失败'}`)
  console.log(`总体结果: ${(unitTestsPassed && integrationTestsPassed) ? '✅ 全部通过' : '❌ 存在失败'}`)
  console.log('================\n')

  return unitTestsPassed && integrationTestsPassed
}

// 运行测试
runTests()
