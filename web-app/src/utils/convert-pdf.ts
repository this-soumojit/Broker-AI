import type { RefObject } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import api from "../services/api";

export const downloadPDFCompatible = async (
  contextRef: RefObject<HTMLDivElement>, phoneNumbers: string[]
) => {
  if (!contextRef.current) {
    alert("Content not found. Please try again.");
    return;
  }

  try {
    // Create a temporary style element to override problematic styles
    const tempStyle = document.createElement("style");
    tempStyle.id = "pdf-temp-styles";
    tempStyle.textContent = `
        * {
          color: rgb(0, 0, 0) !important;
          background-color: rgb(255, 255, 255) !important;
          border-color: rgb(128, 128, 128) !important;
        }

        .hidden { display: none !important; }
        .invisible { visibility: hidden !important; }
        
        .text-gray-800 { color: rgb(31, 41, 55) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-blue-600 { color: rgb(37, 99, 235) !important; }
        .text-green-600 { color: rgb(22, 163, 74) !important; }
        .text-orange-600 { color: rgb(234, 88, 12) !important; }
        .text-red-600 { color: rgb(220, 38, 38) !important; }
        .text-yellow-600 { color: rgb(217, 119, 6) !important; }
        .bg-white { background-color: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
      `;
    document.head.appendChild(tempStyle);

    // Wait a bit for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(contextRef.current, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: contextRef.current.scrollWidth,
      height: contextRef.current.scrollHeight,
      windowWidth: contextRef.current.scrollWidth,
      windowHeight: contextRef.current.scrollHeight,
    });

    // Remove temporary styles
    document.head.removeChild(tempStyle);

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    // Calculate scaling to fit content properly
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(
      contentWidth / (imgWidth * 0.264583),
      contentHeight / (imgHeight * 0.264583)
    );

    const scaledWidth = imgWidth * 0.264583 * ratio;
    const scaledHeight = imgHeight * 0.264583 * ratio;

    // Center the content on the page
    const xOffset = margin + (contentWidth - scaledWidth) / 2;
    const yOffset = margin + (contentHeight - scaledHeight) / 2;

    // Handle multi-page PDFs if content is too tall
    if (scaledHeight > contentHeight) {
      let position = 0;
      let heightLeft = scaledHeight;

      pdf.addImage(
        imgData,
        "JPEG",
        xOffset,
        yOffset + position,
        scaledWidth,
        scaledHeight
      );
      heightLeft -= contentHeight;

      while (heightLeft >= 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          xOffset,
          yOffset + position,
          scaledWidth,
          scaledHeight
        );
        heightLeft -= contentHeight;
      }
    } else {
      pdf.addImage(
        imgData,
        "JPEG",
        xOffset,
        yOffset,
        scaledWidth,
        scaledHeight
      );
    }

    const filename = `invoice.pdf`;

    pdf.save(filename);

    // Get PDF as blob directly from jsPDF
    const pdfBlob = pdf.output("blob");
    const file = new File([pdfBlob], filename, { type: "application/pdf" });

    console.log("PDF file size:", file.size, "bytes");

    // WhatsApp functionality
    try {
      // Array of phone numbers to send to

      // Send to each phone number in parallel
      const sendPromises = phoneNumbers.map(async (phone) => {
        const formData = new FormData();
        formData.append('pdf', file);
        formData.append('phoneNumber', phone);
        formData.append('caption', 'Here is your invoice PDF');

        const response = await api.post('/api/v1/whatsapp/send-pdf', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        });

        return { phone, success: response.data.success };
      });

      // Wait for all sends to complete
      const results = await Promise.allSettled(sendPromises);

      // Log results for each phone number
      results.forEach((result, index) => {
        const phone = phoneNumbers[index];
        if (result.status === 'fulfilled') {
          if (result.value.success) {
            console.log(`WhatsApp PDF sent successfully to ${phone}`);
          } else {
            console.error(`Failed to send WhatsApp PDF to ${phone}`);
          }
        } else {
          console.error(`Error sending WhatsApp PDF to ${phone}:`, result.reason);
        }
      });
    } catch (whatsAppError) {
      console.error("WhatsApp functionality failed:", whatsAppError);
      // Continue without WhatsApp functionality
    }

    // Clean up temporary styles
    const tempStyleElement = document.getElementById("pdf-temp-styles");
    if (tempStyleElement) {
      tempStyleElement.remove();
    }
  } catch (error) {
    console.error("Compatible PDF generation failed:", error);
    alert("Failed to generate PDF. Please try again.");
  }
}; // Email PDF function that reuses the existing PDF generation logic
export const emailPDFCompatible = async (
  contextRef: RefObject<HTMLDivElement>,
  emailData: {
    recipientEmail: string;
    recipientName?: string;
    invoiceNumber?: string;
    senderName?: string;
    customMessage?: string;
  }
) => {
  if (!contextRef.current) {
    throw new Error("Content not found. Please try again.");
  }

  try {
    // Create a temporary style element to override problematic styles
    const tempStyle = document.createElement("style");
    tempStyle.id = "pdf-temp-styles";
    tempStyle.textContent = `
        * {
          color: rgb(0, 0, 0) !important;
          background-color: rgb(255, 255, 255) !important;
          border-color: rgb(128, 128, 128) !important;
        }
        .text-gray-800 { color: rgb(31, 41, 55) !important; }
        .text-gray-700 { color: rgb(55, 65, 81) !important; }
        .text-gray-600 { color: rgb(75, 85, 99) !important; }
        .text-gray-500 { color: rgb(107, 114, 128) !important; }
        .text-blue-600 { color: rgb(37, 99, 235) !important; }
        .text-green-600 { color: rgb(22, 163, 74) !important; }
        .text-orange-600 { color: rgb(234, 88, 12) !important; }
        .text-red-600 { color: rgb(220, 38, 38) !important; }
        .text-yellow-600 { color: rgb(217, 119, 6) !important; }
        .bg-white { background-color: rgb(255, 255, 255) !important; }
        .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
        .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
      `;
    document.head.appendChild(tempStyle);

    // Wait a bit for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    const canvas = await html2canvas(contextRef.current, {
      scale: 1.5,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      width: contextRef.current.scrollWidth,
      height: contextRef.current.scrollHeight,
      windowWidth: contextRef.current.scrollWidth,
      windowHeight: contextRef.current.scrollHeight,
    });

    // Remove temporary styles
    document.head.removeChild(tempStyle);

    const imgData = canvas.toDataURL("image/jpeg", 0.7);
    const pdf = new jsPDF("p", "mm", "a4");

    // A4 dimensions in mm
    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const contentWidth = pdfWidth - (margin * 2);
    const contentHeight = pdfHeight - (margin * 2);

    // Calculate scaling to fit content properly
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(
      contentWidth / (imgWidth * 0.264583),
      contentHeight / (imgHeight * 0.264583)
    );

    const scaledWidth = imgWidth * 0.264583 * ratio;
    const scaledHeight = imgHeight * 0.264583 * ratio;

    // Center the content on the page
    const xOffset = margin + (contentWidth - scaledWidth) / 2;
    const yOffset = margin + (contentHeight - scaledHeight) / 2;

    // Handle multi-page PDFs if content is too tall
    if (scaledHeight > contentHeight) {
      let position = 0;
      let heightLeft = scaledHeight;

      pdf.addImage(
        imgData,
        "JPEG",
        xOffset,
        yOffset + position,
        scaledWidth,
        scaledHeight
      );
      heightLeft -= contentHeight;

      while (heightLeft >= 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(
          imgData,
          "JPEG",
          xOffset,
          yOffset + position,
          scaledWidth,
          scaledHeight
        );
        heightLeft -= contentHeight;
      }
    } else {
      pdf.addImage(
        imgData,
        "JPEG",
        xOffset,
        yOffset,
        scaledWidth,
        scaledHeight
      );
    }

    // Get PDF as blob for email
    const pdfBlob = pdf.output("blob");
    const filename = `invoice-${emailData.invoiceNumber || "document"}.pdf`;
    const pdfFile = new File([pdfBlob], filename, { type: "application/pdf" });

    // Import and send email using the existing service
    const { sendInvoiceEmail } = await import("@/services/invoice-mail");

    // Send the PDF via email
    const result = await sendInvoiceEmail(pdfFile, emailData);

    return result;
  } catch (error) {
    console.error("Email PDF generation failed:", error);
    throw error;
  }
};
