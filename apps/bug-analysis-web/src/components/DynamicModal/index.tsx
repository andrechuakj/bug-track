import { Modal } from 'antd';
import React from 'react';

type Props = {
  modalTitle: string;
  modalOkButtonText: string;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalItems?: React.JSX.Element[];
  handleOk?: () => void;
};

const DynamicModal: React.FC<Props> = ({
  modalTitle,
  modalOkButtonText,
  isModalOpen,
  setIsModalOpen,
  modalItems = [],
  handleOk,
}) => {
  return (
    <>
      <Modal
        title={modalTitle}
        open={isModalOpen}
        okText={modalOkButtonText}
        onOk={handleOk ?? (() => setIsModalOpen(false))}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className="flex flex-col gap-2">
          {modalItems.map((item: React.JSX.Element, idx: number) => (
            <div key={idx}>{item}</div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default DynamicModal;
