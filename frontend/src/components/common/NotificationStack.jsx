import React, {
  useState,
  createContext,
  useContext,
  useCallback,
  useRef,
} from "react";
import styled, { keyframes } from "styled-components";
import { CheckCircle, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { TOAST_COLORS } from "../../messages/toastConstant";

const NotificationContext = createContext(undefined);

const slideIn = keyframes`
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
`;

const progress = keyframes`
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
  width: 100%;
  font-family: "Lexend", sans-serif;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    max-width: none;
  }
`;

const getBorderColor = (type) => {
  return TOAST_COLORS[type] || TOAST_COLORS.info;
};

const NotificationItem = styled.div`
  background: #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: flex-start;
  gap: 14px;
  position: relative;
  overflow: hidden;
  animation: ${(props) => (props.$isExiting ? slideOut : slideIn)} 0.3s ease-out;
  border-left: 4px solid ${(props) => getBorderColor(props.$type)};

  &:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5);
  }

  transition: box-shadow 0.2s ease;
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background: ${(props) => getBorderColor(props.$type)};
  animation: ${progress} ${(props) => props.$duration}ms linear;
  opacity: 0.7;
`;

const IconWrapper = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;

  svg {
    color: ${(props) => getBorderColor(props.$type)};
    width: 20px;
    height: 20px;
  }
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const Title = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #000000;
  margin: 0;
  line-height: 1.3;
`;

const Message = styled.p`
  font-size: 13px;
  color: #686868;
  margin: 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;
  margin-top: -2px;
  margin-right: -4px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    color: #6b7280;
    width: 16px;
    height: 16px;
  }
`;

// HELPER FUNCTIONS
const getIcon = (type) => {
  switch (type) {
    case "success":
      return <CheckCircle />;
    case "error":
      return <AlertCircle />;
    case "warning":
      return <AlertTriangle />;
    default:
      return <Info />;
  }
};

// PROVIDER COMPONENT
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const nextIdRef = useRef(1);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isExiting: true } : n)),
    );
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 300);
  }, []);

  const addNotification = useCallback(
    (type, title, message, duration = 5000) => {
      const id = nextIdRef.current++;
      setNotifications((prev) => [
        ...prev,
        { id, type, title, message, duration, isExiting: false },
      ]);

      setTimeout(() => removeNotification(id), duration);
    },
    [removeNotification],
  );

  const showSuccess = useCallback(
    (title, message) => addNotification("success", title, message),
    [addNotification],
  );
  const showError = useCallback(
    (title, message) => addNotification("error", title, message),
    [addNotification],
  );
  const showWarning = useCallback(
    (title, message) => addNotification("warning", title, message),
    [addNotification],
  );
  const showInfo = useCallback(
    (title, message) => addNotification("info", title, message),
    [addNotification],
  );

  // Convenience method for toast objects from constants
  const showToast = useCallback(
    (type, toastObj) => {
      if (toastObj && toastObj.title && toastObj.message) {
        addNotification(type, toastObj.title, toastObj.message);
      }
    },
    [addNotification],
  );

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showWarning, showInfo, showToast }}
    >
      {children}

      <NotificationContainer>
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            $type={notif.type}
            $isExiting={notif.isExiting}
          >
            <IconWrapper $type={notif.type}>{getIcon(notif.type)}</IconWrapper>
            <Content>
              <Title>{notif.title}</Title>
              <Message>{notif.message}</Message>
            </Content>
            <CloseButton onClick={() => removeNotification(notif.id)}>
              <X />
            </CloseButton>
            {!notif.isExiting && (
              <ProgressBar $type={notif.type} $duration={notif.duration} />
            )}
          </NotificationItem>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

// CUSTOM HOOK
// eslint-disable-next-line react-refresh/only-export-components
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider",
    );
  }
  return context;
};
