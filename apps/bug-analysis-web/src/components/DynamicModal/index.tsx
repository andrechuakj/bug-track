import { Modal } from 'antd';
import React from 'react';

export interface DynamicModalProps {
  modalTitle: string;
  modalOkButtonText: string;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalItems?: React.JSX.Element[];
  handleOk?: () => void;
}
const DynamicModal: React.FC<DynamicModalProps> = ({
  modalTitle,
  modalOkButtonText,
  isModalOpen,
  setIsModalOpen,
  modalItems = [],
  handleOk,
}: DynamicModalProps) => {
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
