export class ThreeDUtil {
  /**
   * 计算圆弧点坐标
   * @param rx 圆心x坐标
   * @param ry 圆心y坐标
   * @param R 半径
   * @param N 分为N段
   */
  calcCirclePoints(rx: number, ry: number, R: number, N: number): Float32Array {
    const point3List = [];
    const radian = (2 * Math.PI) / N; // 弧度
    // 得到每一个圆弧点点坐标
    for (let i = 0; i < N; i++) {
      const currRadian = i * radian; // 当前点点弧度
      const x = rx + R * Math.cos(currRadian);
      const y = ry + R * Math.sin(currRadian);
      point3List.push(x, y, 0);
    }
    const vertices = new Float32Array(point3List);
    return vertices;
  }
}
