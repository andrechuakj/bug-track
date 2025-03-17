import { EditOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Divider, Dropdown, Tag, Typography } from 'antd';
import React, { useEffect } from 'react';
import { useBugDetail } from '../../contexts/BugDetailContext';
import CategoryTag from '../CategoryTag';

const MockCategories = ['Category 1', 'Category 2', 'Category 3', 'Category 4'];

const BugSideBar: React.FC = () => {
  const { bugDetail } = useBugDetail();
  const [categoryMenuItems, setCategoryMenuItems] = React.useState<
    MenuProps['items']
  >([]);

  const handleUpdateCategory = ({ key }: { key: string }) => {
    // TODO
    console.log('Category updated to', key);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = MockCategories;

        const items = response.map((category, index) => ({
          label: category,
          key: index.toString(),
          onClick: handleUpdateCategory,
        }));

        setCategoryMenuItems(items);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };

    fetchCategories();
  }, []);

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
          <Dropdown
            menu={{
              items: categoryMenuItems,
              selectable: true,
              defaultSelectedKeys: [
                bugDetail ? bugDetail.categoryId.toString() : '',
              ],
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <a onClick={(e) => e.preventDefault()}>
              <EditOutlined />
            </a>
          </Dropdown>
        </div>
        {bugDetail?.category ? (
          <CategoryTag
            color="blue"
            text={bugDetail.category}
            className="w-fit"
          />
        ) : (
          'Not categorised'
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <Typography.Title level={5}>Versions affected</Typography.Title>
        {bugDetail?.versionsAffected ? (
          <Typography.Text>
            {bugDetail.versionsAffected.join(', ')}
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
