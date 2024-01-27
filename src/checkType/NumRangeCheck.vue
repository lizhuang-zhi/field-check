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
    <div class="title">请输入数值范围:</div>
    <div class="rang_box">
      <el-input-number
        v-model="minNumInput"
        class="mx-4"
        :min="1"
        :max="99999"
        controls-position="right"
        @change="changeNumRange"
      />
      <div class="middle">至</div>
      <el-input-number
        v-model="maxNumInput"
        class="mx-4"
        :min="1"
        :max="99999"
        controls-position="right"
        @change="changeNumRange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.num_range {
  margin-top: 20px;
  display: flex;
  align-items: center;
  .title {
    margin-right: 10px;
    font-size: 14px;
    color: #555;
  }
  .rang_box {
    display: flex;
    .middle {
      margin-left: 10px;
      margin-right: 10px;
    }
    // 调整 el-input-number 中的输入框宽度
    .el-input-number--large {
      width: 130px; // 根据需要调整宽度
      .el-input--large {
        .el-input__wrapper {
          width: 100%;
          padding-left: 0;
        }
      }
    }
  }
}
</style>