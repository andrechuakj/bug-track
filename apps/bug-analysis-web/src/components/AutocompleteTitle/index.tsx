import { Flex } from 'antd';

type Props = {
  title?: string;
};

const AutocompleteTitle: React.FC<Props> = ({ title }) => (
  <Flex align="center" justify="space-between">
    {title}
  </Flex>
);

export default AutocompleteTitle;
