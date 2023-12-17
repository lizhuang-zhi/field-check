<script>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, onMounted } from "vue";
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption } from "element-plus";
import NumCharactersCheck from "@/checkType/NumCharactersCheck.vue";
import NumRangeCheck from "@/checkType/NumRangeCheck.vue";
import TrimCheck from "@/checkType/TrimCheck.vue";
import { feildTypeToData, checkTypeValueFn } from "@/utils/fieldType.js";

export default {
  components: {
    ElButton,
    ElForm,
    ElFormItem,
    ElSelect,
    ElOption,
    NumCharactersCheck,
    NumRangeCheck,
    TrimCheck,
  },
  setup() {
    const formData = ref({
      table: "", // 表id
      fields: [
        // 字段数组
        {
          fieldID: "",
          checkTypeValue: "",
          // 待添加属性
        },
      ],
      startIndex: 0, // 开始索引
      endIndex: 0, // 结束索引
    });
    // 展示数据
    const tableMetaList = ref([]);
    const fieldMetaList = ref([]);
    const fieldMetaMap = ref({}); // fieldid映射对应对象
    const checkTypeList = ref([
      { label: "字符个数验证", value: "numCharactersCheck" },
      { label: "前后空格验证", value: "trimCheck" },
      { label: "数字范围验证", value: "numRangeCheck" },
    ]);
    const loading = ref(false);
    const noPassTableData = ref([]); // 检查不通过数据表

    onMounted(async () => {
      loading.value = true;
      const [tableList, selection, table] = await Promise.all([
        bitable.base.getTableMetaList(),
        bitable.base.getSelection(),
        bitable.base.getActiveTable(),
      ]);
      // console.log(tableList);
      // console.log(selection);
      // console.log(table);
      const view = await table.getViewById(selection.viewId);
      formData.value.table = selection.tableId;
      tableMetaList.value = tableList;
      fieldMetaList.value = await view.getFieldMetaList(); // 获取所有字段元数据
      for (let item of fieldMetaList.value) {
        fieldMetaMap.value[item.id] = item;
      }
      loading.value = false;
    });

    // const addRecord = async () => {
    //   const tableId = formData.value.table;
    //   if (tableId) {
    //     const table = await bitable.base.getTableById(tableId);
    //     table.addRecord({ fields: {} });
    //   }
    // };

    // 获取选中table的所有记录
    const getAllRecordList = async () => {
      let startIndexValue = parseInt(formData.value.startIndex);
      let endIndexValue = parseInt(formData.value.endIndex);
      if (startIndexValue < 0 || endIndexValue < 1) {
        alert("请输入起始索引和结束索引");
        return [];
      }
      if (startIndexValue > endIndexValue) {
        alert("起始索引不能大于结束索引");
        return [];
      }
      const tableId = formData.value.table;
      if (tableId) {
        const table = await bitable.base.getTableById(tableId);
        const selection = await bitable.base.getSelection();
        const view = await table.getViewById(selection.viewId);
        const recordList = await view.getVisibleRecordIdList(); // 获取有序record的id列表
        if (endIndexValue > recordList.length - 1) {
          alert("结束索引不能大于记录总数");
          return [];
        }
        const NoPassData = []; // 未通过验证的数组数据
        for (let i = startIndexValue; i <= endIndexValue; i++) {
          const record = await table.getRecordById(recordList[i]);

          // 判断单条记录是否通过所有验证
          formData.value.fields.forEach((field) => {
            checkTypeValueFn(record, field, fieldMetaMap.value, NoPassData);
          });
        }
        return NoPassData;
      }
    };

    // 点击查询选中table的所有记录
    const checkAllRecords = async () => {
      loading.value = true;
      const recordList = await getAllRecordList();
      noPassTableData.value = [];
      for (let item of recordList) {
        let data = {};
        for (let key in item.fields) {
          data[key] = feildTypeToData(
            fieldMetaMap.value[key].type,
            item.fields[key]
          );
        }
        noPassTableData.value.push({
          ...data,
        });
      }
      console.log(noPassTableData.value);
      loading.value = false;
    };

    // 添加检查属性
    const addCheckProp = () => {
      formData.value.fields.push({
        fieldID: "",
        checkTypeValue: "",
      });
    };

    // 删除检查属性
    const delCheckProp = () => {
      if (formData.value.fields.length === 1) {
        alert("至少保留一个检查属性");
        return;
      }
      formData.value.fields.pop();
    };

    // 错误单元格样式设置
    const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
      for(let item of formData.value.fields) {
        if(column.property === item.fieldID) {
          return {
            backgroundColor: "yellow", // 设置背景色
            color: "red", // 设置文本颜色
          };
        }
      }
    };

    // 改变table表
    const changeTableEvent = async () => {
      loading.value = true;
      const tableId = formData.value.table;
      if (tableId) {
        const table = await bitable.base.getTableById(tableId);
        const selection = await bitable.base.getSelection();
        const view = await table.getViewById(selection.viewId);
        fieldMetaList.value = await view.getFieldMetaList(); // 获取所有字段元数据
        for (let item of fieldMetaList.value) {
          fieldMetaMap.value[item.id] = item;
        }
        // 清空其他数据
        noPassTableData.value = [];
        formData.value.fields = [
          {
            fieldID: "",
            checkTypeValue: "",
          },
        ];
        formData.value.startIndex = 0;
        formData.value.endIndex = 0;
      }
      loading.value = false;
    };

    // ************************ 类型方法 ****************************
    const changeNumRange = async (data) => {
      console.log(data);
      const { fieldIndex, checkTypeValue } = data;
      if (checkTypeValue === "numRangeCheck") {
        let { minNum, maxNum } = data;
        Object.assign(formData.value.fields[fieldIndex], {
          minNum,
          maxNum,
        });
      } else if (checkTypeValue === "numCharactersCheck") {
        let { minCount, maxCount } = data;
        Object.assign(formData.value.fields[fieldIndex], {
          minCount,
          maxCount,
        });
      }
    };

    return {
      formData,
      tableMetaList,
      fieldMetaList,
      checkTypeList,
      loading,
      noPassTableData,

      cellStyle,
      checkAllRecords,
      addCheckProp,
      delCheckProp,
      changeNumRange,
      changeTableEvent,
    };
  },
};
</script>

<template>
  <div class="form_container" v-loading="loading">
    <el-form ref="form" class="form" :model="formData" label-position="top">
      <el-form-item label="选择数据表" size="large">
        <el-select
          v-model="formData.table"
          placeholder="请选择数据表"
          style="width: 100%"
          @change="changeTableEvent"
        >
          <el-option
            v-for="meta in tableMetaList"
            :key="meta.id"
            :label="meta.name"
            :value="meta.id"
          />
        </el-select>
      </el-form-item>
      <!-- 选项 -->
      <div
        class="check_prop"
        v-for="(field, fieldIndex) in formData.fields"
        :key="fieldIndex"
      >
        <div class="top_line"></div>
        <el-form-item label="选择字段" size="large">
          <el-select
            v-model="field.fieldID"
            placeholder="请选择需要检查的字段"
            style="width: 100%"
          >
            <el-option
              v-for="fieldMeta in fieldMetaList"
              :key="fieldMeta.id"
              :label="fieldMeta.name"
              :value="fieldMeta.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择检查类型" size="large">
          <el-select
            v-model="field.checkTypeValue"
            placeholder="请选择检查类型"
            style="width: 100%"
          >
            <el-option
              v-for="(type, index) in checkTypeList"
              :key="index"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
          <!-- 显示对应检查类型的组件 -->
          <NumCharactersCheck
            v-show="field.checkTypeValue === 'numCharactersCheck'"
            :fieldIndex="fieldIndex"
          />
          <TrimCheck
            v-show="field.checkTypeValue === 'trimCheck'"
            :fieldIndex="fieldIndex"
          />
          <NumRangeCheck
            v-show="field.checkTypeValue === 'numRangeCheck'"
            :fieldIndex="fieldIndex"
            @changeNumRange="changeNumRange"
          />
        </el-form-item>
      </div>
      <!-- 添加检查属性 -->
      <el-form-item label="" size="large">
        <div class="add_container">
          <div class="title">继续添加:</div>
          <el-button type="success" @click="addCheckProp">添加</el-button>
        </div>
        <div class="del_container">
          <div class="title">删除验证:</div>
          <el-button type="primary" @click="delCheckProp">删除</el-button>
        </div>
      </el-form-item>
      <el-form-item label="需要检查的列" size="large">
        <!-- 两个input框, 一个输入起始索引, 一个输入结束索引 -->
        <div class="index_container">
          <div class="box">
            <div class="title">起始索引:</div>
            <el-input
              v-model="formData.startIndex"
              placeholder="请输入起始索引"
              style="width: 60%"
            />
          </div>
          <div class="box">
            <div class="title">结束索引:</div>
            <el-input
              v-model="formData.endIndex"
              placeholder="请输入结束索引"
              style="width: 60%"
            />
          </div>
        </div>
      </el-form-item>
      <el-button type="primary" plain size="large" @click="checkAllRecords"
        >查询记录</el-button
      >
    </el-form>

    <div class="no_pass_data">
      <div class="title">验证不通过记录:</div>
      <div class="table_data">
        <el-table
          :data="noPassTableData"
          style="width: 100%"
          height="350"
          :cell-style="cellStyle"
        >
          <el-table-column
            v-for="(fieldHeader, fieldIndex) in fieldMetaList"
            :key="fieldIndex"
            :prop="fieldHeader.id"
            :label="fieldHeader.name"
            :fixed="fieldIndex === 0"
            width="120"
          />
        </el-table>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.form_container {
  // 表单
  .form {
    &:deep(.el-form-item__label) {
      font-size: 16px;
      color: var(--el-text-color-primary);
      margin-bottom: 0;
    }
    &:deep(.el-form-item__content) {
      font-size: 16px;
    }
    .check_prop {
      margin-top: 20px;
      .top_line {
        width: 100%;
        height: 1px;
        background-color: #aaa;
        margin-bottom: 20px;
      }
    }
    .add_container {
      width: 100%;
      display: flex;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid #aaa;

      .title {
        margin-right: 10px;
      }
    }
    .del_container {
      width: 100%;
      display: flex;
      align-items: center;
      padding-top: 10px;

      .title {
        margin-right: 10px;
      }
    }
    .index_container {
      display: flex;
      align-items: center;
      .box {
        width: 100%;
        display: flex;
        .title {
          margin-right: 10px;
        }
      }
    }
  }

  .no_pass_data {
    margin-top: 20px;
    margin-bottom: 20px;
    .title {
      font-size: 16px;
    }
  }
}
</style>