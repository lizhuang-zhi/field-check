// 抽象接口
class TypeInterface {
    constructor(fieldID, checkTypeValue) {
        this.fieldID = fieldID
        this.checkTypeValue = checkTypeValue
    }
}

// 具体实现
// 字符个数验证
class NumCharacters extends TypeInterface {
    constructor(fieldID, checkTypeValue, minCount, maxCount) {
        super(fieldID, checkTypeValue)
        this.minCount = minCount
        this.maxCount = maxCount
    }
}

// 前后空格验证
class Trim extends TypeInterface {
    constructor(fieldID, checkTypeValue) {
        super(fieldID, checkTypeValue)
    }
}

// 数字范围验证
class NumRange extends TypeInterface {
    constructor(fieldID, checkTypeValue, minNum, maxNum) {
        super(fieldID, checkTypeValue)
        this.minNum = minNum
        this.maxNum = maxNum
    }
}

// 换行符验证


// // 邮箱验证
// class Email extends TypeInterface {
//     constructor(fieldID,  checkTypeValue) {
//         super(fieldID,  checkTypeValue)
//     }
// }

// // 手机号验证
// class Phone extends TypeInterface {
//     constructor(fieldID,  checkTypeValue) {
//         super(fieldID,  checkTypeValue)
//     }
// }

// // 身份证验证
// class IDCard extends TypeInterface {
//     constructor(fieldID,  checkTypeValue) {
//         super(fieldID,  checkTypeValue)
//     }
// }

// // 密码验证
// class Password extends TypeInterface {
//     constructor(fieldID,  checkTypeValue) {
//         super(fieldID,  checkTypeValue)
//     }
// }

// // 密码确认验证
// class PasswordConfirm extends TypeInterface {
//     constructor(fieldID,  checkTypeValue, passwordID) {
//         super(fieldID,  checkTypeValue)
//         this.passwordID = passwordID
//     }
// }

// // 密码强度验证
// class PasswordStrength extends TypeInterface {
//     constructor(fieldID,  checkTypeValue, minNum, maxNum) {
//         super(fieldID,  checkTypeValue)
//         this.minNum = minNum
//         this.maxNum = maxNum
//     }
// }