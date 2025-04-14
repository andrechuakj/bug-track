import { LeftCircleFilled } from '@ant-design/icons';
import { Button, Form, Grid, Input, message, Typography } from 'antd';
import { useRouter } from 'next/router';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { SignupRequestDto } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { MessageContext } from '../contexts/MessageContext';

type SignupFormValues = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
};

const Signup: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<SignupFormValues>();
  const { isAuthenticated, signup, loading } = useAuth();
  const [signupError, setSignupError] = useState<string | null>(null);
  const messageApi = useContext(MessageContext);
  const successfulSignup = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !loading && !successfulSignup.current) {
      messageApi?.success('Already logged in');
      router.push('/');
    }
  }, [isAuthenticated, messageApi, router, loading]);

  const screens = Grid.useBreakpoint();

  const onFinish = (values: SignupFormValues): void => {
    setSignupError(null);
    (async () => {
      try {
        const authValues: SignupRequestDto = {
          email: values.email,
          name: values.name,
          password: values.password,
        };
        const success = await signup(authValues);
        if (success) {
          messageApi?.success('Signup successful!');
          successfulSignup.current = true;
          void router.push('/');
        } else {
          setSignupError('Signup failed. Please try again.');
        }
      } catch (error) {
        console.error('Signup error:', error);
        setSignupError('An error occurred during signup.');
      }
    })();
  };

  const onFinishFailed = (_errorInfo: any): void => {
    message.error('Please check the form for errors.');
  };

  const onBackLogin = useCallback(() => void router.push('/login'), [router]);

  return (
    <div
      className={`flex flex-col lg:flex-row items-center overflow-x-hidden min-h-full lg:max-h-full justify-center`}
    >
      <div
        className={`flex flex-col w-full lg:w-1/2 max-w-xl mb-6 items-center lg:-translate-y-[24px]`}
      >
        <h1 className={`text-5xl font-bold mb-4`}>Welcome to</h1>
        <img src="/bug_track_logo.png" alt="Logo" className={`w-full `} />
      </div>
      <div />
      <Form<SignupFormValues>
        form={form}
        name="signup_form"
        layout={screens.md ? 'horizontal' : 'vertical'}
        labelCol={screens.md ? { span: 8 } : undefined}
        wrapperCol={screens.md ? { span: 12 } : undefined}
        className={`w-2/3 lg:w-1/2 flex flex-col items-center`}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <div className="mb-2 cursor-pointer" onClick={onBackLogin}>
          <LeftCircleFilled />
          <span className="ml-2">Log in</span>
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
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please enter your name!' }]}
          className={`w-full max-w-xs md:max-w-xl`}
        >
          <Input placeholder="Name" />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: 'Please enter your password!' },
            {
              min: 10,
              message: 'Password must be at least 10 characters long!',
            },
          ]}
          hasFeedback
          className={`w-full max-w-xs md:max-w-xl`}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
        <Form.Item
          label="Confirm Password"
          name="confirmPassword"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords do not match!')
                );
              },
            }),
          ]}
          className={`w-full max-w-xs md:max-w-xl`}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
        {signupError && (
          <Typography.Text type="danger">{signupError}</Typography.Text>
        )}
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Sign Up
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Signup;
