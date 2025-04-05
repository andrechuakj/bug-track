import {
  BugOutlined,
  GithubOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SunOutlined,
} from '@ant-design/icons';
import {
  Button,
  ConfigProvider,
  Layout,
  Menu,
  MenuProps,
  message,
  Row,
  Space,
  Switch,
  theme,
  Typography,
} from 'antd';
import Grid from 'antd/es/card/Grid';
import Sider from 'antd/es/layout/Sider';
import { Content, Header } from 'antd/es/layout/layout';
import { useRouter } from 'next/router';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { APP_THEME } from '../../utils/theme';
import { AppTheme } from '../../utils/types';
import DatabaseDropdown from '../DatabaseDropdown';
import styles from './index.module.css';

const AppLayout: React.FC<PropsWithChildren<unknown>> = ({ children }) => {
  const [siderCollapse, setSiderCollapse] = useState<boolean>(false);
  const { isAuthenticated, logout } = useAuth();

  const router = useRouter();

  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <BugOutlined />,
      label: 'Bug Report',
      onClick: () => void router.push('/home'),
    },
  ];

  const pathNameToKeyMap: { [pathName: string]: string } = {
    ['/home']: '1',
  };

  const { Text } = Typography;
  const { theme: themeSetting, updateTheme } = useAppContext();
  const isDarkMode = themeSetting === 'dark';
  const logo = siderCollapse ? '/favicon.ico' : '/bug_track_logo.png';
  const logoStyle = siderCollapse ? 'h-3/6' : 'h-5/6';
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    updateTheme((localStorage.getItem('theme') ?? themeSetting) as AppTheme);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    messageApi.success('Successfully logged out');
  }, []);

  return (
    <ConfigProvider
      theme={{
        ...APP_THEME,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgLayout: isDarkMode
            ? 'linear-gradient(135deg, #121826 0%, #1f2a44 50%, #2c3e60 100%)'
            : 'linear-gradient(135deg, #F2F2F2 0%, #E0E0E0 50%, #D6D6D6 100%)',
        },
      }}
    >
      {contextHolder}
      <Layout className={'h-screen overflow-hidden'}>
        <Sider
          trigger={null}
          collapsible
          collapsed={siderCollapse}
          collapsedWidth="55"
          breakpoint="xs"
          onBreakpoint={(c) => setSiderCollapse(c)}
          width="11vw"
          className={styles.sider}
        >
          <div className="flex flex-col h-full">
            <div role="img" className="flex justify-center h-16 items-center">
              <img src={logo} className={logoStyle} alt={'BugTrack logo'} />
            </div>

            {isAuthenticated && <DatabaseDropdown />}

            <Menu
              theme="dark"
              mode="inline"
              defaultSelectedKeys={[pathNameToKeyMap[router.pathname] ?? '1']}
              items={menuItems}
              className={styles.menuItem}
            />

            <Grid className="mt-auto p-4">
              {!siderCollapse && (
                <Row>
                  <Text className="font-thin text-sm text-white/[.33]">
                    Made by: Group 10/10
                  </Text>
                </Row>
              )}
              <Row gutter={6}>
                <a
                  href="https://github.com/NUS-CS3213-AY2425S2/bug-analysis-project-group-10"
                  target="_blank"
                  rel="noreferrer"
                >
                  <GithubOutlined className={styles.ghSymbol} />
                </a>
              </Row>
            </Grid>
          </div>
        </Sider>

        <Layout>
          <Header className={styles.header}>
            <Button
              icon={
                siderCollapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
              }
              onClick={() => setSiderCollapse((c) => !c)}
            />
            <Text className="pl-3 text-lg/loose text-white">
              {`Bug Track - Never Let It Bug You Again 🫶`}
            </Text>

            <Space className={styles.switch}>
              {isAuthenticated && (
                <>
                  <p className="text-white">Selected DBMS:</p>
                  <DatabaseDropdown />
                </>
              )}
              {isAuthenticated && (
                <Button onClick={void handleLogout}>Logout</Button>
              )}
              <Switch
                checkedChildren={<MoonOutlined />}
                unCheckedChildren={<SunOutlined />}
                value={isDarkMode}
                onChange={(checked) => updateTheme(checked ? 'dark' : 'light')}
              />
            </Space>
          </Header>
          <Content className={`${styles.content} overflow-auto`}>
            {children}
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default AppLayout;
