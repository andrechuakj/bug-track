import type { ThemeConfig } from 'antd';

export enum BugTrackColors {
  GREEN = '#6FBC98',
  YELLOW = '#E0E3A6',
  ORANGE = '#EFC1A1',
  PURPLE = '#7F51DB',
  BLUE = '#84D2F3',
}

export const APP_THEME: ThemeConfig = {
  token: {
    colorPrimary: BugTrackColors.GREEN,
  },
  components: {
    Button: {
      defaultHoverBorderColor: BugTrackColors.GREEN,
      defaultHoverColor: BugTrackColors.GREEN,
      defaultHoverBg: 'rgba(111, 188, 152, 0.25)',
    },
    Card: {
      headerBg: BugTrackColors.YELLOW,
    },
  },
};
