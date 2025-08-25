import axios from "axios";
import env from "../config/env";

export const uploadPDFDocument = async (file: File) => {
  
  try {
    const data = new FormData();
    data.append('messaging_product', 'whatsapp');
    data.append('file', file, file.name);
    data.append('type', 'document');

    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v22.0/${env.WHATSAPP.PHONE_ID}/media`,
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP.API_TOKEN}`,
      },
      data: data
    });

    return response.data;

  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

export const sendTextMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v22.0/${env.WHATSAPP.PHONE_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message,
        },
      })})

      console.log('WhatsApp message sent successfully:', response.data);

  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

// Send media message with a link while the file is stored in cloud storage
export const sendMediaWithLinkMessage = async (phoneNumber: string, mediaUrl: string, caption: string) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v22.0/${env.WHATSAPP.PHONE_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'document',
        document: {
          link: mediaUrl,
          caption: caption,
          filename: "invoice.pdf"
        },
      }),
    });

    console.log('WhatsApp media message sent successfully:', response.data);

  } catch (error) {
    console.error('Failed to send WhatsApp media message:', error);
    throw error;
  }
}

// Send media message with an ID after uploading the file to WhatsApp
export const sendMediaWithIdMessage = async (phoneNumber: string, mediaId: string, caption: string) => {
  try {
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v22.0/${env.WHATSAPP.PHONE_ID}/messages`,
      headers: {
        'Authorization': `Bearer ${env.WHATSAPP.API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'document',
        document: {
          id: mediaId,
          caption: caption,
          filename: "invoice.pdf"
        },
      }),
    });

    console.log('WhatsApp media message sent successfully:', response.data);

  } catch (error) {
    console.error('Failed to send WhatsApp media message:', error);
    throw error;
  }
}
