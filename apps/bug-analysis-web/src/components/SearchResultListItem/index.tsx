import { LoadingOutlined } from '@ant-design/icons';
import { List, Typography } from 'antd';
import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { BugSearchResult, BugSearchResultCategory } from '../../utils/bug';

export interface SearchResultListItemProps {
  searchResultCategory: BugSearchResultCategory;
  handleLoadMore?: (tenantId: number, categoryId: number) => void;
}

const SearchResultListItem: React.FC<SearchResultListItemProps> = ({
  searchResultCategory,
  handleLoadMore,
}: SearchResultListItemProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { currentTenant } = useSession();

  const handleClickLoadMore = async () => {
    setIsLoading(true);
    if (currentTenant) {
      await handleLoadMore?.(currentTenant.id, searchResultCategory.categoryId);
    }
    setIsLoading(false);
  };

  return (
    <List.Item className="flex flex-col">
      <Typography.Title level={5} className="self-start">
        {searchResultCategory.title}
      </Typography.Title>
      <List
        size="small"
        dataSource={searchResultCategory.bugs}
        className="self-start"
        renderItem={(bug: BugSearchResult) => (
          <List.Item>
            {`${bug.display}: `}
            <span className="font-extralight">{`${bug.description.slice(0, 200)}`}</span>
          </List.Item>
        )}
      />
      {handleLoadMore && !isLoading && (
        <Typography.Link
          className="self-start"
          disabled={isLoading}
          onClick={handleClickLoadMore}
        >
          Load more
        </Typography.Link>
      )}
      {handleLoadMore && isLoading && (
        <LoadingOutlined className="self-start" />
      )}
    </List.Item>
  );
};

export default SearchResultListItem;
