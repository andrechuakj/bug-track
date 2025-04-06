import { Flex } from 'antd';

export interface AutocompleteTitleProps {
  title?: string;
}

const AutocompleteTitle: React.FC<Readonly<AutocompleteTitleProps>> = ({
  title,
}) => (
  <Flex align="center" justify="space-between">
    {title}
  </Flex>
);

export default AutocompleteTitle;
