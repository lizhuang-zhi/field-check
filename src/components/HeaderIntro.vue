<script>
import { computed } from "vue";

export default {
  setup() {
    return {};
  },
};
</script>

<template>
  <!-- 介绍部分 -->
  <div class="intro_container quote">
    <div class="rule_tit">规则：</div>
    <div class="include_fields">
      类型详情：<a
        href="https://lilithgames.feishu.cn/docx/JcAod2DOuorsR2xVhKYcANIgnWg"
        target="_blank"
        >链接地址</a
      >
    </div>
  </div>
</template>

<style scoped lang="less">
// 介绍部分
.intro_container {
  width: 100%;
  .rule_tit {
    font-size: 16px;
    font-weight: bold;
    padding-top: 10px;
    margin-bottom: 12px;
  }
  .include_fields {
    line-height: 22px;
  }
}
.quote {
  border-left: 3px solid #ccc;
  padding-left: 10px;
  font-size: 14px;
  margin-bottom: 16px;
  color: #606266;
}
</style>