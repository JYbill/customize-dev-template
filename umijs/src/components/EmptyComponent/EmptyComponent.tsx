/**
 * @Description: 解决umijs request 配置中使用静态message导致[antd: message] Static function can not consume问题
 * @Author: 小钦var
 * @Date: 2024/5/8 21:08
 */
import { App } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';
import type { ModalStaticFunctions } from 'antd/es/modal/confirm';
import type { NotificationInstance } from 'antd/es/notification/interface';
import React from 'react';

let message: MessageInstance;
let notification: NotificationInstance;
let modal: Omit<ModalStaticFunctions, 'warn'>;

const EmptyComponent: React.FC<{ children: React.ReactNode }> = (props) => {
  const staticFunction = App.useApp();
  message = staticFunction.message;
  modal = staticFunction.modal;
  notification = staticFunction.notification;
  return props.children;
};

export const AppWrapper: React.FC<{ children: React.ReactNode }> = (props) => {
  return (
    <App>
      <EmptyComponent>{props.children}</EmptyComponent>
    </App>
  );
};
export { message, modal, notification };
