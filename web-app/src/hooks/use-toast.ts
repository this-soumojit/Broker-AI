import { isAxiosError } from "axios";
import { toast } from "sonner";

const useToast = () => {
  const showInfo = (msg: string) => toast.info(msg);
  const showSuccess = (msg: string) => toast.success(msg);
  const showWarning = (msg: string) => toast.warning(msg);

  const showError = (error: unknown) => {
    if (isAxiosError(error)) {
      if (error.response) {
        toast.error(
          `${error.response.data.message}. Please contact support if the issue persists.`
        );
      } else {
        toast.error(
          "An unexpected error occurred while processing your request. Please try again later."
        );
      }
    } else if (error instanceof Error) {
      toast.error(
        `An error occurred: ${error.message}. Please reach out to support for assistance.`
      );
    } else {
      toast.error(
        "An unknown error has occurred. Please contact support for further assistance."
      );
    }
  };

  return { showInfo, showSuccess, showWarning, showError };
};

export { useToast };
