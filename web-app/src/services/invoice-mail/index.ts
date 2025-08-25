import api from "../api";
import { 
    SendInvoiceEmailRequest, 
    SendInvoiceEmailMultipleRequest, 
    SendInvoiceEmailResponse 
} from '@/interfaces/index';


/**
 * Send invoice PDF to a single email address
 */
export const sendInvoiceEmail = async (
  pdfFile: File,
  emailData: SendInvoiceEmailRequest
): Promise<SendInvoiceEmailResponse> => {
  const formData = new FormData();
  
  // Add the PDF file
  formData.append('invoice', pdfFile);
  
  // Add email data
  formData.append('recipientEmail', emailData.recipientEmail);
  if (emailData.recipientName) formData.append('recipientName', emailData.recipientName);
  if (emailData.invoiceNumber) formData.append('invoiceNumber', emailData.invoiceNumber);
  if (emailData.senderName) formData.append('senderName', emailData.senderName);
  if (emailData.customMessage) formData.append('customMessage', emailData.customMessage);

  const response = await api.post('/api/v1/invoice-mail/send', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * Send invoice PDF to multiple email addresses
 */
export const sendInvoiceEmailMultiple = async (
  pdfFile: File,
  emailData: SendInvoiceEmailMultipleRequest
): Promise<SendInvoiceEmailResponse> => {
  const formData = new FormData();
  
  // Add the PDF file
  formData.append('invoice', pdfFile);
  
  // Add email data
  formData.append('recipientEmails', emailData.recipientEmails);
  if (emailData.invoiceNumber) formData.append('invoiceNumber', emailData.invoiceNumber);
  if (emailData.senderName) formData.append('senderName', emailData.senderName);
  if (emailData.customMessage) formData.append('customMessage', emailData.customMessage);

  const response = await api.post('/api/v1/invoice-mail/send-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};