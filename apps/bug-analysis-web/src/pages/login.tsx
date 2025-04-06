import { Button, Form, Grid, Input, message, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { LoginRequestDto } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { toPromise } from '../utils/promises';
import { RightCircleFilled } from '@ant-design/icons';
import { MessageContext } from '../contexts/MessageContext';

type LoginFormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<LoginFormValues>();
  const { isAuthenticated, login, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const messageApi = useContext(MessageContext);

  useEffect(() => {
    if (isAuthenticated) {
      if (messageApi) {
        messageApi.success('Already logged in');
      }
      router.push('/');
    }
  }, []);

  const onFormSubmit = (values: LoginFormValues) => {
    setLoginError(null);
    const authValues: LoginRequestDto = {
      email: values.email,
      password: values.password,
    };
    toPromise(login)(authValues)
      .then((success) => {
        if (success) {
          if (messageApi) {
            messageApi.success('Login successful!');
          }
          router.push('/');
        } else {
          setLoginError('Invalid email or password. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Login error:', error);
        setLoginError('An error occurred during login.');
      });
  };

  const onLoginFail = (_errorInfo: {
    values: LoginFormValues;
    errorFields: { name: (string | number)[]; errors: string[] }[];
    outOfDate?: boolean;
  }): void => {
    message.error('Please check the form for errors.');
  };

  const screens = Grid.useBreakpoint();

  const handleSignUpOnClick = useCallback(
    () => router.push('/signup'),
    [router]
  );

  return (
    <div
      className={`flex flex-col lg:flex-row items-center overflow-x-hidden min-h-full lg:max-h-full justify-center`}
    >
      <div
        className={`flex flex-col w-full lg:w-1/2 max-w-xl mb-6 items-center lg:-translate-y-[24px]`}
      >
        <img src="/bug_track_logo.png" alt="Logo" className={`w-full `} />
      </div>
      <div />
      <Form<LoginFormValues>
        form={form}
        name="login_form"
        layout={screens.md ? 'horizontal' : 'vertical'}
        labelCol={screens.md ? { span: 8 } : undefined}
        wrapperCol={screens.md ? { span: 12 } : undefined}
        className={`w-2/3 lg:w-1/2 flex flex-col items-center`}
        onFinish={onFormSubmit}
        onFinishFailed={onLoginFail}
      >
        <div
          className="mb-2 cursor-pointer"
          onClick={() => {
            handleSignUpOnClick();
          }}
        >
          <span className="mr-2">Sign up</span>
          <RightCircleFilled />
        </div>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Please enter your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
          className={`w-full max-w-xs md:max-w-xl`}
        >
          <Input placeholder="Email" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: 'Please enter your password!' }]}
          className={`w-full max-w-xs md:max-w-xl`}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        {loginError && (
          <Typography.Text type="danger">{loginError}</Typography.Text>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Log In
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
