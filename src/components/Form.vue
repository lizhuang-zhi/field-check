<script>
import { bitable } from "@lark-base-open/js-sdk";
import { ref, onMounted } from "vue";
import { ElButton, ElForm, ElFormItem, ElSelect, ElOption } from "element-plus";
import NumCharactersCheck from "@/checkType/NumCharactersCheck.vue";
import NumRangeCheck from "@/checkType/NumRangeCheck.vue";
import TrimCheck from "@/checkType/TrimCheck.vue";
import { feildTypeToData, checkTypeValueFn } from "@/utils/fieldType.js";
import HeaderIntro from "@/components/HeaderIntro.vue";

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
    HeaderIntro,
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
    const NoPassDataFields = ref([]); // 记录每条record没有通过的字段数组

    const selectRecordList = ref([]); // 小窗选中记录列表

    onMounted(async () => {
      loading.value = true;
      const [tableList, selection, table] = await Promise.all([
        bitable.base.getTableMetaList(),
        bitable.base.getSelection(),
        bitable.base.getActiveTable(),
      ]);
      const view = await table.getViewById(selection.viewId);
      formData.value.table = selection.tableId;
      tableMetaList.value = tableList;
      fieldMetaList.value = await view.getFieldMetaList(); // 获取所有字段元数据
      for (let item of fieldMetaList.value) {
        fieldMetaMap.value[item.id] = item;
      }
      loading.value = false;
    });

    // ************************ 事件 ****************************
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
        NoPassDataFields.value = [];
        formData.value.fields = [
          {
            fieldID: "",
            checkTypeValue: "",
          },
        ];
      }
      loading.value = false;
    };

    // 小窗选择记录
    const selectRecords = async () => {
      // 清空selsectRecordList
      selectRecordList.value = [];

      // 重新获取选中记录
      const { tableId, viewId } = await bitable.base.getSelection();
      const recordIdList = await bitable.ui.selectRecordIdList(tableId, viewId);
      const table = await bitable.base.getActiveTable();
      for (const recordId of recordIdList) {
        selectRecordList.value.push(await table.getRecordById(recordId)); // 获取选中的记录
      }
    };

    // 点击查询记录
    const checkSelectRecords = async () => {
      loading.value = true;
      if (selectRecordList.value.length === 0) {
        // 全局提示
        await bitable.ui.showToast({
          toastType: "error",
          message: "请先选择需要检查的记录",
        });
        loading.value = false;
        return;
      }

      // 验证选中记录
      let noPassDataRecordList = await verifyAllRecords();

      noPassTableData.value = [];
      for (let item of noPassDataRecordList) {
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
    const delCheckProp = async () => {
      if (formData.value.fields.length === 1) {
        // 全局提示
        await bitable.ui.showToast({
          toastType: "error",
          message: "至少保留一个检查属性",
        });
        return;
      }
      formData.value.fields.pop();
    };

    // ************************ 业务代码 ****************************
    // 验证选中记录, 返回不通过的记录
    const verifyAllRecords = async () => {
      if (selectRecordList.value.length == 0) {
        return [];
      }
      const tableId = formData.value.table;
      if (tableId) {
        const NoPassData = []; // 未通过验证的数组数据
        NoPassDataFields.value = [];
        for (let i = 0; i < selectRecordList.value.length; i++) {
          const record = selectRecordList.value[i];

          let ErrCount = 0; // 单条记录验证错误次数
          let ErrFields = []; // 单条记录验证错误的field字段id
          // 判断单条记录是否通过所有验证
          formData.value.fields.forEach((field) => {
            let verify = checkTypeValueFn(record, field, fieldMetaMap.value);
            if (!verify) {
              ErrFields.push(field.fieldID);
              ErrCount++;
            }
          });

          if (ErrCount !== 0) {
            NoPassData.push(record);
            NoPassDataFields.value.push(ErrFields);
          }
          ErrCount = 0; // 重置数据
        }
        console.log(NoPassDataFields);
        return NoPassData;
      }
    };
    /* 
      1. 去除重复: 用单条记录进行所有验证, 每个验证不通过的记录+1, 最后记录不为0的才存入NoPassData
      2. 高亮处理: 维护一个二维数组, 存入的二维度数组为每条NoPassData记录的不通过的列字段id
      [
        ["fieldID—1"],
        ["fieldID—1", "fieldID—4"],     // 这里没有去重复列字段多验证类型的情况
        ["fieldID—1"],
      ]
    */

    // 错误单元格样式设置
    const cellStyle = ({ row, column, rowIndex, columnIndex }) => {
      for (let rIx = 0; rIx < NoPassDataFields.value.length; rIx++) {
        for (let fIx = 0; fIx < NoPassDataFields.value[rIx].length; fIx++) {
          if (
            rowIndex === rIx &&
            column.property === NoPassDataFields.value[rIx][fIx]
          ) {
            return {
              backgroundColor: "yellow", // 设置背景色
              color: "red", // 设置文本颜色
            };
          }
        }
      }
    };

    // ************************ 类型方法 ****************************
    const changeNumRange = async (data) => {
      // console.log(data);
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
      selectRecordList,

      cellStyle,
      checkSelectRecords,
      addCheckProp,
      delCheckProp,
      changeNumRange,
      changeTableEvent,

      selectRecords,
    };
  },
};
</script>

<template>
  <!-- 标题介绍 -->
  <HeaderIntro></HeaderIntro>

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
          <div class="check_and_btn">
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
            <!-- 新增或删除 -->
            <div class="add_container">
              <el-button type="success" @click="addCheckProp">添加</el-button>
            </div>
            <div class="del_container">
              <el-button type="primary" @click="delCheckProp">删除</el-button>
            </div>
          </div>
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
      <el-form-item label="" size="large"> </el-form-item>
      <el-form-item label="" size="large">
        <el-button type="success" plain size="large" @click="selectRecords"
          >选择记录</el-button
        >
        <el-button type="primary" plain size="large" @click="checkSelectRecords"
          >查询记录</el-button
        >
      </el-form-item>
    </el-form>
  </div>

  <!-- 验证不通过数据展示 -->
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
</template>

<style scoped lang="less">
.form_container {
  // 表单
  .form {
    &:deep(.el-form-item__label) {
      font-size: 14px;
      color: var(--el-text-color-primary);
    }
    &:deep(.el-form-item__content) {
      font-size: 14px;
    }

    .check_and_btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .add_container {
        margin-left: 15px;
      }
      .del_container {
        margin-left: 5px;
      }
    }
  }
}

.no_pass_data {
  margin-top: 20px;
  margin-bottom: 20px;
  .title {
    font-size: 14px;
  }
}
</style>