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
    <div class="title">请输入字符个数范围:</div>
    <div class="rang_box">
      <el-input-number
        v-model="minCountInput"
        class="mx-4"
        :min="1"
        :max="9999"
        controls-position="right"
        @change="changeNumRange"
      />
      <div class="middle">至</div>
      <el-input-number
        v-model="maxCountInput"
        class="mx-4"
        :min="1"
        :max="9999"
        controls-position="right"
        @change="changeNumRange"
      />
    </div>
  </div>
</template>

<style scoped lang="less">
.num_characters {
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