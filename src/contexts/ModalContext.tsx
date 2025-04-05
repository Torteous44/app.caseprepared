import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalType = "login" | "register" | null;

interface ModalContextType {
  modalType: ModalType;
  openModal: (type: "login" | "register") => void;
  closeModal: () => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [modalType, setModalType] = useState<ModalType>(null);

  const openModal = (type: "login" | "register") => {
    setModalType(type);
  };

  const closeModal = () => {
    setModalType(null);
  };

  const isOpen = modalType !== null;

  return (
    <ModalContext.Provider
      value={{
        modalType,
        openModal,
        closeModal,
        isOpen,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export default ModalContext;
