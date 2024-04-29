/**
 * @time 2024/4/25
 * @auth Administrator
 * @desc
 */
import { Button, Flex, Modal } from 'antd';
import React, { memo } from 'react';

type SureDelModalProps<T = any> = {
  type?: T; // 类型
  value?: any; // 值
  open: boolean;
  setOpen: (flag: boolean) => void;
  openAfterHandler: (data: { type: T; value: any }) => void;
};

const index = <T,>(props: SureDelModalProps<T>) => {
  return (
    <Modal
      title="是否确认删除此栏目"
      width="320px"
      open={props.open}
      forceRender
      destroyOnClose={false}
      maskClosable={false}
      footer={null}
      closeIcon={null}
    >
      <Flex vertical gap="middle">
        <div>栏目删除后，栏目内的所有课程将一并删除。请确认是否要进行删除操作。</div>
        <Button
          type="primary"
          danger
          onClick={() => {
            props.setOpen(false);
            props.openAfterHandler({
              type: props.type as T,
              value: props.value,
            });
          }}
        >
          确认删除
        </Button>
        <Button onClick={() => props.setOpen(false)}>取消</Button>
      </Flex>
    </Modal>
  );
};

export default memo(index) as typeof index;
