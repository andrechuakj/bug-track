import { Grid, Form, Input, Button, FormInstance } from 'antd';
import DatabaseDropdown from '../components/DatabaseDropdown';
import React, { useLayoutEffect, useRef, useState } from 'react';

interface LoginFormValues {
  database: string;
  username: string;
  password: string;
}

const onFormSubmit = (values: LoginFormValues): void => {
  console.log('onFormSubmit | values:', values);
  // todo auth
};


const onLoginFail = (errorInfo: {
  values: LoginFormValues;
  errorFields: { name: (string | number)[]; errors: string[] }[];
  outOfDate?: boolean;
}): void => {
  console.log('Failed:', errorInfo);
};


const Login: React.FC = () => {
  const [form] = Form.useForm();
  const selectedDb = Form.useWatch('database', form);

  const formIsValid = (form: FormInstance) => {
    const requiredFields = ['database', 'username', 'password'];

    const values = form.getFieldsValue(requiredFields);
    const allFieldsFilled = Object.values(values).every((value) => value);

    const errors = form.getFieldsError(requiredFields);
    const hasErrors = errors.some(({ errors }) => errors.length > 0);

    return allFieldsFilled && !hasErrors;
  };

  const animation = "duration-1000 ease-in-out";
  const screens = Grid.useBreakpoint();

  const [fieldsHeight, setFieldsHeight]: [number, React.Dispatch<React.SetStateAction<number>>] = useState(0);
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
        className={`w-full lg:w-1/2 max-w-xl mb-6 lg:-translate-y-[24px] transition-transform ${animation}`}
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
        <Form.Item
          label="Database"
          name="database"
          rules={[
            { required: true, message: 'Please select a database!' },
          ]}
          className={`w-full max-w-xs md:max-w-md transition-all ${animation}`}
        >
          <DatabaseDropdown/>
        </Form.Item>
        <div // for setting boundaries for visible children in transition, and resizing
          className={`w-full max-w-xs md:max-w-md overflow-hidden flex items-end transition-all ${animation} 
          ${selectedDb ? `h-[${fieldsHeight}px]` : 'h-0'}
          `}
        >
          <div // for moving vertically for small and large screens
            ref={fieldsRef}
            className={`w-full transition-opacity ${animation} 
          ${selectedDb ? 'opacity-100' : 'opacity-0'}
          ${selectedDb ? "pointer-events-auto" : "pointer-events-none"}
          `}
          >
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: 'Please enter your username!' },
              ]}
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
        <Form.Item className={"text-center w-full max-w-xs mt-4"}
                   wrapperCol={screens.md ? { offset: 0, span: 24 } : undefined}
                   shouldUpdate>
          {() => {
            const isDisabled: boolean = !formIsValid(form);
            return (
              <Button
                type="primary"
                htmlType="submit"
                className={`w-1/2 transition-transform ${animation}`}
                disabled={ isDisabled }
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