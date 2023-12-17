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
    const minNumInput = ref("");
    const maxNumInput = ref("");
    onMounted(async () => {});

    const changeNumRange = async () => {
      if (minNumInput.value === "" || maxNumInput.value === "") {
        return;
      }
      if (Number(minNumInput.value) > Number(maxNumInput.value)) {
        alert("最小数值不能大于最大数值");
        minNumInput.value = "";
        maxNumInput.value = "";
        return;
      }
      // 发送事件到父组件
      emit("changeNumRange", {
        fieldIndex: props.fieldIndex,
        checkTypeValue: "numRangeCheck",
        minNum: Number(minNumInput.value),
        maxNum: Number(maxNumInput.value),
      });
    };

    return {
      minNumInput,
      maxNumInput,
      changeNumRange,
    };
  },
};
</script>

<template>
  <div class="num_range">
    <div class="box">
      <div class="min_cont">最小数值限制:</div>
      <el-input
        v-model="minNumInput"
        type="number"
        placeholder="请输入最小数值限制"
        @change="changeNumRange"
      />
    </div>
    <div class="box">
      <div class="max_cont">最大数值限制:</div>
      <el-input
        v-model="maxNumInput"
        type="number"
        placeholder="请输入最大数值限制"
        @change="changeNumRange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.num_range {
  display: flex;
  align-items: center;
  .box {
    margin-right: 30px;
    font-size: 14px;
  }
}
</style>