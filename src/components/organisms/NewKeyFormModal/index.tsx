import {PlusOutlined} from '@ant-design/icons';
import type {ButtonProps} from 'antd/lib/button';
import Button from 'antd/lib/button';
import Form from 'antd/lib/form';
import Input from 'antd/lib/input';
import Modal from 'antd/lib/modal/Modal';
import type {PropsWithChildren, ReactElement} from 'react';
import React from 'react';
import {useDispatch} from 'react-redux';
import {editorSlice} from 'src/store/slices/editor-slice';

export function NewKeyFormModal(
  props: PropsWithChildren<NewKeyFormModalProps>,
): ReactElement {
  const {children, ...restProps} = props;

  const dispatch = useDispatch();

  const [newKeyForm] = Form.useForm<{
    newKey: string;
  }>();

  const [isNewKeyModalVisible, setIsNewKeyModalVisible] =
    React.useState<boolean>(false);

  const handleOpenNewKeyModal = React.useCallback(() => {
    setIsNewKeyModalVisible(true);
  }, []);

  const handleCloseNewKeyModal = React.useCallback(() => {
    setIsNewKeyModalVisible(false);
    newKeyForm.setFieldsValue({
      newKey: '',
    });
  }, [newKeyForm]);

  const handleSaveNewKeyModal = React.useCallback(async () => {
    const {newKey} = await newKeyForm.validateFields();
    if (newKey) {
      dispatch(editorSlice.actions.addKey(newKey));
    }
    handleCloseNewKeyModal();
  }, [dispatch, handleCloseNewKeyModal, newKeyForm]);

  return (
    <>
      <Button
        {...restProps}
        type="primary"
        className="d-flex align-items-center ml-2"
        icon={<PlusOutlined />}
        onClick={handleOpenNewKeyModal}>
        {children}
      </Button>
      <Modal
        title="Add new key"
        centered
        open={isNewKeyModalVisible}
        closable={true}
        onOk={handleSaveNewKeyModal}
        onCancel={handleCloseNewKeyModal}
        destroyOnClose={true}
        width={1000}>
        <Form form={newKeyForm}>
          <Form.Item label="New Key" name="newKey" required={true}>
            <Input
              onPressEnter={() => {
                handleSaveNewKeyModal();
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export interface NewKeyFormModalProps extends ButtonProps {
  //
}

NewKeyFormModal.defaultProps = {
  //
};

NewKeyFormModal.displayName = 'NewKeyFormModal';

export default NewKeyFormModal;
