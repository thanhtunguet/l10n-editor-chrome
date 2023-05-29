import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal';
import Table from 'antd/lib/table';
import type {FC} from 'react';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import DevopsConnectModal from 'src/components/organisms/DevopsConnectModal';
import type {DevopsServer} from 'src/models/devops-server';
import {serverSelector} from 'src/store/selectors';
import {devopsSlice} from 'src/store/slices/devops-slice';

const {Column} = Table;

const DevopsPage: FC = () => {
  const dispatch = useDispatch();

  const servers: DevopsServer[] = useSelector(serverSelector);

  const [modal, contextHolder] = Modal.useModal();

  const [isModalVisible, setIsModalVisible] = React.useState<boolean>(false);
  const [form] = Form.useForm<DevopsServer>();

  const handleResetForm = React.useCallback(() => {
    form.setFieldsValue({
      name: '',
      url: '',
    });
  }, [form]);

  const saveNewServer = React.useCallback(() => {
    const devopsServer = form.getFieldsValue();
    dispatch(devopsSlice.actions.saveServer(devopsServer));
    setIsModalVisible(false);
    handleResetForm();
  }, [dispatch, form, handleResetForm]);

  const handleConfirmDeleteServer = React.useCallback(
    (record: DevopsServer) => {
      modal.confirm({
        title: 'Delete this server',
        icon: <ExclamationCircleOutlined />,
        content: <code>{record.url}</code>,
        okType: 'danger',
        okText: 'Delete',
        onOk() {
          dispatch(devopsSlice.actions.deleteServer(record));
        },
      });
    },
    [dispatch, modal],
  );

  const handleCloseModal = React.useCallback(() => {
    setIsModalVisible(false);
    handleResetForm();
  }, [handleResetForm]);

  return (
    <>
      {contextHolder}

      <div className="d-flex justify-content-end my-2">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          className="d-flex align-items-center"
          onClick={() => {
            setIsModalVisible(true);
          }}>
          Add server
        </Button>
      </div>

      <Table dataSource={servers} showHeader={true} rowKey="id">
        <Column key="ID" title="ID" dataIndex="id" />
        <Column key="Name" title="Name" dataIndex="name" />
        <Column
          key="URL"
          title="URL"
          dataIndex="url"
          render={(value) => {
            return (
              <a href={value} target="_blank">
                <code>{value}</code>
              </a>
            );
          }}
        />
        <Column
          key="Actions"
          title="Actions"
          dataIndex="id"
          render={(value, record: DevopsServer, _index) => {
            return (
              <React.Fragment key={value}>
                <Button
                  type="link"
                  className="d-inline-flex align-items-center mx-2"
                  icon={<EditOutlined />}
                  onClick={() => {
                    form.setFieldsValue(record);
                    setIsModalVisible(true);
                  }}>
                  Edit
                </Button>
                <Button
                  type="link"
                  className="d-inline-flex align-items-center mx-2 text-danger"
                  icon={<DeleteOutlined />}
                  onClick={() => handleConfirmDeleteServer(record)}>
                  Delete
                </Button>

                <DevopsConnectModal devops={record} />
              </React.Fragment>
            );
          }}
        />
      </Table>
      <Modal
        open={isModalVisible}
        okText="Save"
        onOk={saveNewServer}
        onCancel={handleCloseModal}
        closable={true}
        destroyOnClose={true}>
        <Form layout="vertical" form={form}>
          <Form.Item label="Name" name="name" required={true}>
            <Input placeholder="Devops Server Name" allowClear={true} />
          </Form.Item>

          <Form.Item label="URL" name="url" required={true}>
            <Input
              placeholder="https://devops.example.com/DefaultCollection"
              allowClear={true}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

DevopsPage.displayName = '/devops';

export default DevopsPage;
