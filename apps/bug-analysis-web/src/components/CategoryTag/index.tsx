import { Tag, TagProps } from 'antd';
import { ReactNode, useMemo } from 'react';

type Props = TagProps & {
  text: string;
  color: string;
  iconIsNumber?: boolean;
  iconNumber?: number;
  icon?: ReactNode;
};

const CategoryTag: React.FC<Props> = ({
  text,
  color,
  iconIsNumber,
  iconNumber,
  icon,
  ...additional
}) => {
  const leadingIcon = useMemo(() => {
    if (iconIsNumber && iconNumber) {
      return <span>{iconNumber}</span>;
    } else if (icon) {
      return icon;
    }
    return <></>;
  }, [iconIsNumber, iconNumber, icon]);

  return (
    <Tag color={color} icon={leadingIcon} bordered {...additional}>
      {text}
    </Tag>
  );
};

export default CategoryTag;
