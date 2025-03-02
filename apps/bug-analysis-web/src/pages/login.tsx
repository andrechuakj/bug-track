import { Form, Input, Button, Row, Col, FormInstance } from 'antd';
import DatabaseDropdown from '../components/DatabaseDropdown';

interface LoginFormValues {
  database: string;
  username: string;
  password: string;
}

const onFormSubmit = (values: LoginFormValues) => {
  console.log('Form values:', values);
  // todo auth
};


const onLoginFail = (errorInfo) => {
  console.log('Failed:', errorInfo);
};


const Login: React.FC = () => {
  const [form] = Form.useForm();
  const selectedDb = Form.useWatch('database', form);

  const fullField = {
    transform: selectedDb ? 'translateX(0)' : 'translateX(25%)',
    transition: 'transform 0.5s ease-in-out',
  };

  const rightField = {
    opacity: selectedDb ? 1 : 0,
    transition: 'opacity 0.5s ease-in-out',
  };

  const formIsValid = (form: FormInstance) => {
    const requiredFields = ['database', 'username', 'password'];

    const values = form.getFieldsValue(requiredFields);
    const allFieldsFilled = Object.values(values).every((value) => value);

    const errors = form.getFieldsError(requiredFields);
    const hasErrors = errors.some(({ errors }) => errors.length > 0);

    return allFieldsFilled && !hasErrors;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <img
        src="/bug_track_logo.png"
        alt="Logo"
        style={{ width: 500, marginBottom: 24 }}
      />
      <Form<LoginFormValues>
        name="login_form"
        layout="vertical"
        initialValues={{ remember: true }}
        style={{ width: '70%', minWidth: '300px', maxWidth: '600px' }}
        form={form}
        onFinish={onFormSubmit}
        onFinishFailed={onLoginFail}
      >
        <Col>
          <Row gutter={16} style={fullField}>
            <Col span={12} style={{ display: 'flex', alignItems: 'top' }}>
              <Form.Item
                label="Database"
                name="database"
                rules={[
                  { required: true, message: 'Please select a database!' },
                ]}
                style={{ width: '100%', paddingBottom: '25px' }}
              >
                <DatabaseDropdown/>
              </Form.Item>
            </Col>
            <Col span={12} style={rightField} >
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
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'center' }} shouldUpdate>
            {() => {
              const isDisabled: boolean = !formIsValid(form);
              return (
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: '50%' }}
                  disabled={ isDisabled }
                >
                  Log In
                </Button>
              );
            }}
          </Form.Item>
        </Col>
      </Form>
    </div>
  );
};

export default Login;