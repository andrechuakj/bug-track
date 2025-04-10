import {
  CheckOutlined,
  EditOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Divider,
  Dropdown,
  Form,
  Input,
  Skeleton,
  Tag,
  Typography,
} from 'antd';
import { Store } from 'antd/es/form/interface';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BugCategoryResponseDto,
  fetchAllCategories,
  updateBugCategory,
  updateBugPriority,
  updateBugVersionsAffected,
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
  const [isVersionsUpdating, setIsVersionsUpdating] = useState(false);
  const [isEditingVersions, setIsEditingVersions] = useState(false);
  const [categoryMenuItems, setCategoryMenuItems] = useState<
    MenuProps['items']
  >([]);
  const [form] = Form.useForm();

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

  const priorityMenuItems = useMemo(() => {
    if (!bugReport) return [];
    return Object.entries(BugPriority).map(([key, value]) => ({
      label: value,
      key,
      onClick: () => handleUpdatePriority(bugReport.id, value as BugPriority),
    }));
  }, [bugReport, handleUpdatePriority]);

  const handleUpdateVersions = useCallback(
    async (bug_id: number, formFields: Store) => {
      setIsVersionsUpdating(true);
      const updatedVersions = formFields.updatedVersions as string;
      try {
        const updatedReport = await updateBugVersionsAffected(
          bug_id,
          updatedVersions
        );
        setBugReport(updatedReport);
      } catch (error) {
        console.error('Failed to update priority:', error);
      } finally {
        setIsEditingVersions(false);
        setIsVersionsUpdating(false);
      }
    },
    [setBugReport]
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
                defaultSelectedKeys: [
                  bugReport?.priority ?? BugPriority.UNASSIGNED,
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
            {bugReport?.priority ?? BugPriority.UNASSIGNED}
          </Tag>
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <Typography.Title level={5}>Versions affected</Typography.Title>
          {!isBugLoading &&
            (isVersionsUpdating ? (
              <LoadingOutlined />
            ) : isEditingVersions ? (
              <CheckOutlined
                className="hover:cursor-pointer"
                onClick={() => form.submit()}
              />
            ) : (
              <EditOutlined
                className="hover:cursor-pointer"
                onClick={() => setIsEditingVersions(true)}
              />
            ))}
        </div>
        {isBugLoading && <Skeleton.Input active size="small" />}
        {!isBugLoading && !isEditingVersions && (
          <Typography.Text>
            {bugReport?.versions_affected
              ? bugReport.versions_affected
              : 'Not specified'}
          </Typography.Text>
        )}
        {!isBugLoading && isEditingVersions && (
          <Form
            form={form}
            onFinish={(values) =>
              handleUpdateVersions(bugReport!.id, values as Store)
            }
          >
            <Form.Item
              name="updatedVersions"
              rules={[{ required: false }]}
              className="mb-0"
            >
              <Input
                autoFocus
                onPressEnter={() => form.submit()}
                defaultValue={bugReport?.versions_affected ?? ''}
              />
            </Form.Item>
          </Form>
        )}
      </div>

      <Divider />
    </div>
  );
};

export default BugSideBar;
