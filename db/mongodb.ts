/**
 * 将id字符串转成ObjectId对象
 * @param id
 * @return {*}
 */
export function getObjectId(id) {
  if (typeof id === "string" && id.length !== 24) {
    this.ctx.logger.error(id);
    this.ctx.throw(400, "传入的id无法转成ObjectId");
  }
  const ObjectId = this.ctx.app.mongoose.Types.ObjectId;
  return ObjectId(id);
}
