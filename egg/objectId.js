/**
 * @time 2022/7/5 15:05
 * @author xiaoqinvar
 * @desc 有关db对校验规则, 采用状态机模式
 * @dependence
 */
module.exports = (app) => {
  const {validator} = app;

  // objectId处理器
  const objectIdHandler = {

    // 字符串处理
    string: (str) => {
      if (!app.mongoose.isValidObjectId(str)) {
        return 'have a value that is not objectId type';
      }
    },

    // 数组处理
    array: (array) => {
      for (const objectId of array) {
        const isObjectId = app.mongoose.isValidObjectId(objectId);
        if (!isObjectId) {
          return 'have a value that is not objectId type';
        }
      }
    }
  };

  // objectId、objectId数组的校验规则
  validator.addRule('objectIdArrayOrValue', (rule, valueArray) => {
    const type = Object.prototype.toString.call(valueArray).toLowerCase().slice(8, -1);
    if (type !== 'array' && type !== 'string') {
      return 'is not string or array type!';
    }
    return objectIdHandler[type](valueArray);
  });
};