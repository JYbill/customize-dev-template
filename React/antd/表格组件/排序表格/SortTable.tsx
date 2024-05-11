/**
 * @time 2024/5/10
 * @auth Administrator
 * @desc
 */
import React, { memo } from 'react';
import type { FC } from 'react';
import useColumn from '@/pages/Manager/Portal/components/Slideshow/column.hook';
import { DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { portal as portalApi } from '@/services/manage';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Table } from 'antd';
import Style from '@/pages/Manager/Portal/components/Slideshow/style.less';
import { UpdateSlideFunc } from './index';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string;
}

interface ISortTableProps {
  sideshowList: API.Slideshow[];
  setSideshowList: React.Dispatch<React.SetStateAction<API.Slideshow[]>>;
  updateSlide: UpdateSlideFunc;
}

/**
 * 排序表格
 * @param sideshowList
 * @param setSideshowList
 * @param updateSlide
 * @constructor
 */
const SortTable: FC<ISortTableProps> = ({ sideshowList, setSideshowList, updateSlide }) => {
  // colum 数据
  const columns = useColumn(sideshowList, updateSlide);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // https://docs.dndkit.com/api-documentation/sensors/pointer#activation-constraints
        distance: 1,
      },
    }),
  );

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = sideshowList.findIndex((i) => i.id === active.id);
      const overIndex = sideshowList.findIndex((i) => i.id === over?.id);
      const list = arrayMove(sideshowList, activeIndex, overIndex).map((item, i) => {
        item.sequence = i + 1;
        return item;
      });
      setSideshowList(list);
      const slideshowListData = list.map((item) => ({ id: item.id, sequence: item.sequence }));
      const newest = await portalApi.sortSideshow(slideshowListData);
      setSideshowList(newest);
    }
  };

  const TableRow = (props: RowProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: props['data-row-key'],
    });
    const style: React.CSSProperties = {
      ...props.style,
      transform: CSS.Translate.toString(transform),
      transition,
      cursor: 'move',
      ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };
    return <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners} />;
  };
  return (
    <DndContext sensors={sensors} modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
      <SortableContext
        // rowKey array
        items={sideshowList.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <Table
          size="middle"
          className={Style.antTable}
          components={{
            body: { row: TableRow },
          }}
          rowKey="id"
          columns={columns}
          dataSource={sideshowList}
          pagination={false}
        />
      </SortableContext>
    </DndContext>
  );
};

export default memo(SortTable);
