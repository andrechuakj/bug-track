import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Divider, Dropdown, Skeleton, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  BugCategoryResponseDto,
  fetchAllCategories,
  updateBugCategory,
} from '../../api/bugReport';
import { useBugReport } from '../../contexts/BugReportContext';
import CategoryTag from '../CategoryTag';

const BugSideBar: React.FC = () => {
  const { bugReport, setBugReport, isBugLoading } = useBugReport();
  const [isCategoryUpdating, setIsCategoryUpdating] = useState(false);
  const [categoryMenuItems, setCategoryMenuItems] = useState<
    MenuProps['items']
  >([]);

  const handleUpdateCategory = async (bug_id: number, category_id: number) => {
    setIsCategoryUpdating(true);
    try {
      const updatedReport = await updateBugCategory(bug_id, category_id);
      setBugReport(updatedReport);
    } catch (error) {
      console.error('Failed to update category:', error);
    } finally {
      setIsCategoryUpdating(false);
    }
  };

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
  }, [bugReport]);

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
                    bugReport ? bugReport.category_id.toString() : '',
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
        <Typography.Title level={5}>Versions affected</Typography.Title>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading &&
          // TODO: Add this field to schema
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
