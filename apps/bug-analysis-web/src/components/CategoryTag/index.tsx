import { Tag, TagProps } from 'antd';
import { ReactNode } from 'react';

interface CategoryTagProps extends TagProps {
  text: string;
  color: string;
  iconIsNumber?: boolean;
  iconNumber?: number;
  icon?: ReactNode;
}

const CategoryTag: React.FC<CategoryTagProps> = (props: CategoryTagProps) => {
  const { text, color, iconIsNumber, iconNumber, icon, ...additional } = props;

  let leadingIcon: ReactNode = <></>;

  if (iconIsNumber && iconNumber) {
    leadingIcon = <span>{iconNumber}</span>;
  } else if (icon) {
    leadingIcon = icon;
  }

  return (
    <Tag color={color} icon={leadingIcon} bordered {...additional}>
      {text}
    </Tag>
  );
};

export default CategoryTag;
