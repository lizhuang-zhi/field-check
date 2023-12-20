// 根据字段类型转换字符串数据
/* 
    @param fieldType: 字段类型
    @param fieldValue: 字段值
    @return: 对应类型字符串
*/
export function feildTypeToData(fieldType, fieldValue) {
    if (fieldValue === null) {
        return ""
    }
    switch (fieldType) {
        case 1:  // 文本字段
            let result = ""
            for (let item of fieldValue) {
                result += item.text
            }
            return result
        case 2:  // 数字字段
            return String(fieldValue)
        case 3:  // 单选字段
            return fieldValue.text
        case 4:  // 多选字段
            if (!fieldValue) return ""
            let mutiRes = ""
            for (let item of fieldValue) {
                mutiRes += item.text
            }
            return mutiRes
        case 20:  // 公式字段
            if (!fieldValue) return ""
            if (fieldValue.length === 0) return ""
            if (typeof fieldValue === "number") return String(fieldValue)
            return fieldValue[0].text
        case 21:  // 双向关联字段
            return fieldValue.text   // 被关联记录的文本汇总值，用 , 连接
        case 1004:  // 人员字段
            return fieldValue[0].name
        default:
            throw new Error('该字段类型暂不支持:' + fieldType + " " + fieldValue)  // 其他字段类型, 暂不支持
        // return ''  // 其他字段类型, 暂不支持
    }
}

// 按照类型检查单条记录
/* 
  @param record: 需要检查的记录对象
  @param field: 检查字段对象 { fieldID, checkTypeValue, minNum, maxNum, minCount, maxCount, ...}
  @param fieldMetaMap: 字段元数据映射
*/
export function checkTypeValueFn(record, field, fieldMetaMap) {
    const { fieldID, checkTypeValue } = field;
    if (fieldID && checkTypeValue) {
        let fieldValue = record.fields[fieldID];
        if (checkTypeValue === "numCharactersCheck") {
            const { minCount, maxCount } = field;
            // 根据字段类型转换数据(为字符串)
            let resultFieldValueStr = feildTypeToData(
                fieldMetaMap[fieldID].type,
                fieldValue
            );
            if (
                resultFieldValueStr.length < minCount ||
                resultFieldValueStr.length > maxCount
            ) {
                return false;
            }
        } else if (checkTypeValue === "trimCheck") {
            // 根据字段类型转换数据(为字符串)
            let resultFieldValueStr = feildTypeToData(
                fieldMetaMap[fieldID].type,
                fieldValue
            );
            if (resultFieldValueStr.trim() !== resultFieldValueStr) {
                return false;
            }
        } else if (checkTypeValue === "numRangeCheck") {
            const { minNum, maxNum } = field;
            // 根据字段类型转换数据(为字符串)
            let resultFieldValueStr = feildTypeToData(
                fieldMetaMap[fieldID].type,
                fieldValue
            );
            // 判断是否能够转为数字类型
            if (isNaN(Number(resultFieldValueStr))) {
                alert(fieldValue + ": 该字段不能转为数字类型");
                return false;
            }
            if (Number(resultFieldValueStr) === 0 && resultFieldValueStr !== "0") {
                alert(fieldValue + ": 该字段不能转为数字类型");
                return false;
            }
            if (Number(resultFieldValueStr) < minNum || Number(resultFieldValueStr) > maxNum) {
                return false;
            }
        }
    }
    return true;
};