import { EditOutlined, LoadingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Divider, Dropdown, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import {
  BugCategoryResponseDto,
  fetchAllCategories,
  updateBugCategory,
} from '../../api/bug_report';
import { useBugReport } from '../../contexts/BugReportContext';
import CategoryTag from '../CategoryTag';

const BugSideBar: React.FC = () => {
  const { bugReport } = useBugReport();
  const [isCategoryUpdating, setIsCategoryUpdating] = React.useState(false);
  const [categoryMenuItems, setCategoryMenuItems] = React.useState<
    MenuProps['items']
  >([]);

  const handleUpdateCategory = async (bug_id: number, category_id: number) => {
    setIsCategoryUpdating(true);
    await updateBugCategory(bug_id, category_id);
    setIsCategoryUpdating(false);
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
        <Tag color="red" className="w-fit">
          TiDB
        </Tag>
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Typography.Title level={5}>Category</Typography.Title>
          {categoryMenuItems && categoryMenuItems.length > 0 && (
            <Dropdown
              menu={{
                items: categoryMenuItems,
                selectable: true,
                defaultSelectedKeys: [
                  bugReport ? bugReport.categoryId.toString() : '',
                ],
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
        {bugReport?.category ? (
          <CategoryTag
            color="blue"
            text={bugReport.category}
            className="w-fit"
          />
        ) : (
          'Not categorised'
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>Versions affected</Typography.Title>
        {bugReport?.versionsAffected ? (
          <Typography.Text>
            {bugReport.versionsAffected.join(', ')}
          </Typography.Text>
        ) : (
          'Not specified'
        )}
      </div>

      <Divider />
    </div>
  );
};

export default BugSideBar;
