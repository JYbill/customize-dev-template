/**
 * @time 2024/4/23
 * @auth xiaoqinvar
 * @desc
 */
import React, {memo, useState} from "react";
import type {FC, ReactNode} from "react";
import { Space, Switch, Table, TableColumnsType } from 'antd';
import type { PaginationProps } from 'antd';
import Style from "./style.less"
import moment from 'moment';

interface ITableTemplateProps {
    children?: ReactNode;
}

type UserInfoData = {}

const rowSelection = {
    // 点击勾选时的钩子
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserInfoData[]) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
    },
};

/**
 * 分页组件的渲染
 * @param _
 * @param type
 * @param originalElement
 */
const pageRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
    if (type === 'prev') {
        return <a className={Style.pageBtn}>上一页</a>;
    }
    if (type === 'next') {
        return <a className={Style.pageBtn}>下一页</a>;
    }
    return originalElement;
};

const TableTemplate: FC<ITableTemplateProps> = (props) => {
    // 分页状态
    const [page, setPage] = useState<API.PageResponse>({
        count: 0,
        list: [],
        currentPage: 1,
        pageNum: 10,
    });

    const columns: TableColumnsType<UserInfoData> = [
        {
            title: '用户名',
            dataIndex: 'name',
        },
        {
            title: '注册邮箱',
            dataIndex: 'email',
        },
        {
            title: '角色',
            dataIndex: 'role',
        },
        {
            title: '注册时间',
            dataIndex: 'createTime',
            render: (value) => {
                let date = value;
                if (date) {
                    date = moment(date).format('YYYY-MM-DD hh:mm:ss');
                } else {
                    date = '-';
                }
                return date;
            },
        },
        {
            title: '最后一次登录时间',
            dataIndex: 'loginTime',
            render: (value) => {
                let date = value;
                if (date) {
                    date = moment(date).format('YYYY-MM-DD hh:mm:ss');
                } else {
                    date = '-';
                }
                return date;
            },
        },
        {
            title: '启用',
            dataIndex: 'banned',
            render: (text, record, index) => {
                return <Switch value={!text} onChange={() => {}} />;
            },
        },
        {
            title: '操作',
            dataIndex: 'id',
            render: () => {
                return (
                    <Space size="middle">
                        <img className={Style.tableOperaIcon} src="/assets/edit-icon.png" alt="" />
                        <img className={Style.tableOperaIcon} src="/assets/del-icon2.png" alt="" />
                    </Space>
                );
            },
        },
    ];

    return <div>
        <Table
            className={Style.antTable}
            size="middle"
            /* 表格选择器 */
            rowSelection={{
                type: 'checkbox',
                ...rowSelection,
            }}
            rowKey={(record) => record.id}
            columns={columns}
            dataSource={page.list}
            pagination={{
                size: 'small',
                itemRender: pageRender,
                total: page.count,
                showSizeChanger: false,
                current: page.currentPage,
                pageSize: page.pageNum,
                onChange(currentPage) {
                    const res = { ...page, list: [], currentPage };
                    setPage(res);
                },
            }}
        />
    </div>;
};

export default memo(TableTemplate);
