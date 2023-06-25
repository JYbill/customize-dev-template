const point3List = [];
const rx = 10;
const ry = 10;
const R = 10; // 半径
const N = 10; // 分为10段
const radian = (2 * Math.PI) / N; // 弧度
// 得到每一个圆弧点点坐标
for (let i = 0; i < N; i++) {
  const currRadian = i * radian; // 当前点点弧度
  const x = rx + R * Math.cos(currRadian);
  const y = ry + R * Math.sin(currRadian);
  point3List.push(x, y, 0);
}
const vertices = new Float32Array(point3List);

export {};
