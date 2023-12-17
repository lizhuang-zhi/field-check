<script>
import { ref, onMounted } from "vue";
import { ElInput } from "element-plus";

export default {
  components: {
    ElInput,
  },
  props: {
    fieldIndex: {
      type: Number,
      default: 0,
    },
  },
  setup(props, { emit }) {
    const minCountInput = ref("");
    const maxCountInput = ref("");
    onMounted(async () => {});

    const changeNumRange = async () => {
      if (minCountInput.value === "" || maxCountInput.value === "") {
        return;
      }
      if (Number(minCountInput.value) > Number(maxCountInput.value)) {
        alert("最小字符个数不能大于最大字符个数");
        minCountInput.value = "";
        maxCountInput.value = "";
        return;
      }
      // 发送事件到父组件
      emit("changeNumRange", {
        fieldIndex: props.fieldIndex,
        checkTypeValue: "numCharactersCheck",
        minCount: Number(minCountInput.value),
        maxCount: Number(maxCountInput.value),
      });
    };

    return {
      minCountInput,
      maxCountInput,
      changeNumRange,
    };
  },
};
</script>

<template>
  <div class="num_characters">
    <div class="box">
      <div class="min_cont">最小字符个数:</div>
      <el-input
        v-model="minCountInput"
        type="number"
        placeholder="请输入最小字符限制"
        @change="changeNumRange"
      />
    </div>
    <div class="box">
      <div class="max_cont">最大字符个数:</div>
      <el-input
        v-model="maxCountInput"
        type="number"
        placeholder="请输入最大字符限制"
        @change="changeNumRange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.num_characters {
  display: flex;
  align-items: center;
  .box {
    margin-right: 30px;
    font-size: 14px;
  }
}
</style>