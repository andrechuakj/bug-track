import {
  Button,
  Form,
  FormInstance,
  Grid,
  Input,
  message,
  Typography,
} from 'antd';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { LoginValues } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login, loading } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);

  const onFormSubmit = async (values: LoginFormValues): Promise<void> => {
    console.log('onFormSubmit | values:', values);
    setLoginError(null);
    try {
      const authValues: LoginValues = {
        email: values.email,
        password: values.password,
      };
      const success = await login(authValues);
      if (success) {
        message.success('Login successful!');
      } else {
        setLoginError('Invalid username or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An error occurred during login.');
    }
  };

  const onLoginFail = (errorInfo: {
    values: LoginFormValues;
    errorFields: { name: (string | number)[]; errors: string[] }[];
    outOfDate?: boolean;
  }): void => {
    console.log('Failed:', errorInfo);
    message.error('Please check the form for errors.');
  };

  const formIsValid = (form: FormInstance) => {
    const requiredFields = ['email', 'password'];

    const values = form.getFieldsValue(requiredFields);
    const allFieldsFilled = Object.values(values).every((value) => value);

    const errors = form.getFieldsError(requiredFields);
    const hasErrors = errors.some(({ errors }) => errors.length > 0);

    return allFieldsFilled && !hasErrors;
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
      console.log(`${fieldsHeight} -> ${fieldsRef.current.scrollHeight}`);
    }
  }, [screens.md]);

  return (
    <div className="flex flex-col lg:flex-row items-center overflow-x-hidden min-h-full lg:max-h-full justify-center">
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
              <Input placeholder="Enter your Username" />
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
          className={'text-center w-full max-w-xs mt-4 transition-none'}
          wrapperCol={screens.md ? { offset: 0, span: 24 } : undefined}
          shouldUpdate
        >
          {() => {
            const isDisabled: boolean = !formIsValid(form) || loading;
            return (
              <Button
                type="primary"
                htmlType="submit"
                className={`w-1/2 transition-none`}
                disabled={isDisabled}
                loading={loading}
              >
                Log In
              </Button>
            );
          }}
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
