/**
 * @time 2024/5/8
 * @auth xiaoqinvar
 * @desc
 */
import { Link, Outlet } from '@umijs/max';
import type { FC } from 'react';
import { memo } from 'react';

const AntdLayout: FC = () => {
  return (
    <div>
      <div>antd 首页</div>
      <Link to="form-upload">1. 表单 + 裁剪 + 文件上传</Link>
      <hr />
      <Outlet />
    </div>
  );
};

export default memo(AntdLayout);
