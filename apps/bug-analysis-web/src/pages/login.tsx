import {
  Button,
  Form,
  FormInstance,
  Grid,
  Input,
  message,
  Typography,
} from 'antd';
import { useRouter } from 'next/router';
import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { LoginRequestDto } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { toPromise } from '../utils/promises';
import { BugTrackColors } from '../utils/theme';

type LoginFormValues = {
  email: string;
  password: string;
};

const formIsValid = (form: FormInstance<LoginFormValues>) => {
  const requiredFields: Array<keyof LoginFormValues> = ['email', 'password'];
  const allFieldsFilled = requiredFields.every((field) => {
    const value = form.getFieldValue(field) as string | undefined;
    return !!value;
  });

  const errors = form.getFieldsError(requiredFields);
  const hasErrors = errors.some(({ errors }) => errors.length > 0);

  return allFieldsFilled && !hasErrors;
};

const Login: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm<LoginFormValues>();
  const { login, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  const onFormSubmit = (values: LoginFormValues) => {
    setLoginError(null);
    const authValues: LoginRequestDto = {
      email: values.email,
      password: values.password,
    };
    toPromise(login)(authValues)
      .then((success) => {
        if (success) {
          messageApi.success('Login successful!');
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

  const [fieldsHeight, setFieldsHeight]: [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ] = useState(0);
  const fieldsRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    if (fieldsRef.current) {
      setFieldsHeight(fieldsRef.current.scrollHeight);
    }
  }, [screens.md]);

  const handleSignUpOnClick = useCallback(
    () => router.push('/signup'),
    [router]
  );

  return (
    <div className="flex flex-col lg:flex-row items-center overflow-x-hidden min-h-full lg:max-h-full justify-center">
      {contextHolder}
      <img
        src="/bug_track_logo.png"
        alt="Logo"
        className={`w-full lg:w-1/2 max-w-xl mb-6 lg:-translate-y-[24px]`}
      />
      <Form<LoginFormValues>
        name="login_form"
        layout={screens.md ? 'horizontal' : 'vertical'}
        labelCol={screens.md ? { span: 6 } : undefined}
        wrapperCol={screens.md ? { span: 16 } : undefined}
        initialValues={{ remember: true }}
        className={`w-2/3 lg:w-1/2 flex flex-col items-center`}
        form={form}
        onFinish={onFormSubmit}
        onFinishFailed={onLoginFail}
      >
        <div // for setting boundaries for visible children in transition, and resizing
          className={`w-full max-w-xs md:max-w-md overflow-hidden flex items-end`}
          style={{ height: fieldsHeight }}
        >
          <div // for moving vertically for small and large screens
            ref={fieldsRef}
            className="w-full pointer-events-auto"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: 'Please enter your email!' }]}
            >
              <Input placeholder="Enter your Email" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: 'Please enter your password!' },
              ]}
            >
              <Input.Password placeholder="Enter your Password" />
            </Form.Item>
          </div>
        </div>
        {loginError && (
          <Typography.Text type="danger" className="mb-4">
            {loginError}
          </Typography.Text>
        )}
        <Form.Item
          className="w-full max-w-xs mt-4 transition-none"
          wrapperCol={screens.md ? { offset: 0, span: 24 } : undefined}
          shouldUpdate
        >
          {() => {
            const isDisabled = !formIsValid(form) || loading;
            return (
              <div className="flex justify-center">
                <div className="flex flex-col gap-2">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="transition-none w-[256px]"
                    disabled={isDisabled}
                    loading={loading}
                    style={{ background: BugTrackColors.GREEN }}
                  >
                    Log In
                  </Button>
                  <Button
                    type="primary"
                    className="transition-none"
                    loading={loading}
                    style={{ background: BugTrackColors.ORANGE }}
                    onClick={() => {
                      handleSignUpOnClick();
                    }}
                  >
                    Sign up
                  </Button>
                </div>
              </div>
            );
          }}
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
