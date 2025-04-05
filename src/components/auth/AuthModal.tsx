import React from "react";
import Modal from "./Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useModal } from "../../contexts/ModalContext";

const AuthModal: React.FC = () => {
  const { isOpen, modalType, closeModal } = useModal();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={
        modalType === "login" ? "Log in to your account" : "Create an account"
      }
    >
      {modalType === "login" ? <LoginForm /> : <RegisterForm />}
    </Modal>
  );
};

export default AuthModal;
