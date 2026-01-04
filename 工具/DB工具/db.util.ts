export class DBUtil {
  /**
   * 将id字符串转成ObjectId对象
   * @param id
   * @return {*}
   */
  getObjectId(id) {
    if (typeof id === "string" && id.length !== 24) {
      throw new Error("string must > 24 length");
    }
    return ObjectId(id);
  }
}
