import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Divider, Dropdown, Skeleton, Tag, Typography } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import {
  BugCategoryResponseDto,
  fetchAllCategories,
  updateBugCategory,
  updateBugPriority,
} from '../../api/bugReport';
import { useBugReport } from '../../contexts/BugReportContext';
import { BugPriority } from '../../utils/types';
import CategoryTag from '../CategoryTag';

const priorityColorMap: Record<string, string> = {
  High: 'red',
  Medium: 'orange',
  Low: 'green',
  Unassigned: 'default',
};

const BugSideBar: React.FC = () => {
  const { bugReport, setBugReport, isBugLoading } = useBugReport();
  const [isCategoryUpdating, setIsCategoryUpdating] = useState(false);
  const [isPriorityUpdating, setIsPriorityUpdating] = useState(false);
  const [categoryMenuItems, setCategoryMenuItems] = useState<
    MenuProps['items']
  >([]);

  const handleUpdateCategory = useCallback(
    async (bug_id: number, category_id: number) => {
      setIsCategoryUpdating(true);
      try {
        const updatedReport = await updateBugCategory(bug_id, category_id);
        setBugReport(updatedReport);
      } catch (error) {
        console.error('Failed to update category:', error);
      } finally {
        setIsCategoryUpdating(false);
      }
    },
    [setBugReport]
  );

  const handleUpdatePriority = useCallback(
    async (bug_id: number, priority: BugPriority) => {
      setIsPriorityUpdating(true);
      try {
        const updatedReport = await updateBugPriority(bug_id, priority);
        setBugReport(updatedReport);
      } catch (error) {
        console.error('Failed to update priority:', error);
      } finally {
        setIsPriorityUpdating(false);
      }
    },
    [setBugReport]
  );

  const priorityMenuItems: MenuProps['items'] = Object.entries(BugPriority).map(
    ([key, value]) => ({
      label: value,
      key: key,
      onClick: () => handleUpdatePriority(bugReport!.id, value as BugPriority),
    })
  );

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchAllCategories();

        const items = res.map((categoryResponse: BugCategoryResponseDto) => ({
          label: categoryResponse.name,
          key: categoryResponse.id.toString(),
          onClick: () =>
            handleUpdateCategory(bugReport!.id, categoryResponse.id),
        }));

        setCategoryMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    loadCategories();
  }, [bugReport, handleUpdateCategory]);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>DBMS</Typography.Title>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading &&
          (bugReport?.dbms ? (
            <Tag color="red" className="w-fit">
              {bugReport?.dbms}
            </Tag>
          ) : (
            'Not specified'
          ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Typography.Title level={5}>Category</Typography.Title>
          {!isBugLoading &&
            categoryMenuItems &&
            categoryMenuItems.length > 0 && (
              <Dropdown
                menu={{
                  items: categoryMenuItems,
                  selectable: true,
                  defaultSelectedKeys: [
                    bugReport?.category_id?.toString() ?? '',
                  ],
                  style: {
                    overflowY: 'scroll',
                    maxHeight: '200px',
                  },
                }}
                trigger={['click']}
                placement="bottomRight"
              >
                <a onClick={(e) => e.preventDefault()}>
                  {isCategoryUpdating ? <LoadingOutlined /> : <EditOutlined />}
                </a>
              </Dropdown>
            )}
        </div>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading &&
          (bugReport?.category ? (
            <CategoryTag
              color="blue"
              text={bugReport.category}
              className="w-fit"
            />
          ) : (
            'Not categorised'
          ))}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Typography.Title level={5}>Bug Priority</Typography.Title>
          {!isBugLoading && (
            <Dropdown
              menu={{
                items: priorityMenuItems,
                selectable: true,
                defaultSelectedKeys: [bugReport?.priority ?? 'Unassigned'],
                style: {
                  overflowY: 'scroll',
                  maxHeight: '200px',
                },
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <a onClick={(e) => e.preventDefault()}>
                {isPriorityUpdating ? <LoadingOutlined /> : <EditOutlined />}
              </a>
            </Dropdown>
          )}
        </div>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading && (
          <Tag
            color={
              priorityColorMap[bugReport?.priority ?? BugPriority.UNASSIGNED]
            }
            className="w-fit"
          >
            {bugReport?.priority ? bugReport.priority : 'Not specified'}
          </Tag>
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>Versions affected</Typography.Title>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading &&
          // TODO: Add this field to schema
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          ((bugReport as any)?.versionsAffected ? (
            <Typography.Text>
              {/* TODO: Update dynamically */}
              1.0.1
            </Typography.Text>
          ) : (
            'Not specified'
          ))}
      </div>

      <Divider />
    </div>
  );
};

export default BugSideBar;
