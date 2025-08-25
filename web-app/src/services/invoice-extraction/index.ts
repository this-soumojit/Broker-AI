import api from '../api';
import { ExtractedInvoiceData } from '@/interfaces';

export const extractInvoiceData = async (
  imageFile: File
): Promise<ExtractedInvoiceData> => {
  const formData = new FormData();
  formData.append('invoice', imageFile);

  try {
    const response = await api.post('/api/v1/invoice-extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (!response.data.success) {
      throw new Error('Failed to extract invoice data');
    }

    return response.data.data;
  } catch (error) {
    throw error;
  }
};
