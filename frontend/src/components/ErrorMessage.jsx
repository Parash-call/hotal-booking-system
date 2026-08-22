import { AlertTriangle } from "lucide-react";

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div className="alert alert-error" role="alert">
      <AlertTriangle size={18} />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
