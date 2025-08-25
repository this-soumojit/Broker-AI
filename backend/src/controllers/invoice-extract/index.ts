import { NextFunction, Request, Response } from "express";
import OpenAI from "openai";
import multer from "multer";

const openai = new OpenAI({ apiKey: process.env.OPEN_AI_KEY });

export type InvoiceExtractionResult = {
    invoiceNumber?: string;
    invoiceDate?: string;
    invoiceGrossAmount?: number;
    invoiceDiscountAmount?: number;
    invoiceTaxAmount?: number;
    invoiceNetAmount?: number;
    transportDetails?: {
        transportName?: string;
        transportNumber?: string;
        transportStation?: string;
        lorryReceiptNumber?: string;
        lorryReceiptDate?: string;
    };
    eWayBillNumber?: string;
    eWayBillDate?: string;
    challanNumber?: string;
    challanDate?: string;
    weight?: number;
    freight?: number;
    caseNumber?: string;
    products?: Array<{
        name: string;
        quantity: number;
        unit: string;
        rate: number;
        gstRate: number;
        discountRate: number;
    }>;
};

export const uploadInvoice = async (req: Request & { file?: Express.Multer.File}, res: Response, next: NextFunction) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded"});
        }

        
        const result = await extractInvoice(req.file.buffer);
        
        // Check if we have raw JSON data
        if (result && 'raw' in result && typeof result.raw === 'string') {
            try {
                // Remove the ```json and ``` wrapper if present
                const cleanJson = result.raw.replace(/```json\n|\n```|```/g, '');
                // Parse the cleaned JSON string
                const parsedData = JSON.parse(cleanJson);
                
                res.json({
                    success: true,
                    data: parsedData
                });
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
                res.status(400).json({
                    success: false,
                    error: 'Failed to parse invoice data'
                });
            }
        } else {
            // If no raw property, assume it's already properly structured data
            res.json({
                success: true,
                data: result
            });
        }
    }
    catch (err) {
        next(err);
    }
}

export const upload = multer({ storage: multer.memoryStorage() });

export async function extractInvoice(imageBuffer: Buffer): Promise<InvoiceExtractionResult> {
    // Convert image buffer to base64
    const base64Image = imageBuffer.toString("base64");
    // Call OpenAI Vision API (replace with actual endpoint and parameters)
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: 
`Extract the following invoice details from this image and return a JSON object with this exact structure:
{
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceGrossAmount?: number;
  invoiceDiscountAmount?: number;
  invoiceTaxAmount?: number;
  invoiceNetAmount?: number;
  transportDetails?: {
    transportName?: string;
    transportNumber?: string;
    transportStation?: string;
    lorryReceiptNumber?: string;
    lorryReceiptDate?: string;
  };
  eWayBillNumber?: string;
  eWayBillDate?: string;
  challanNumber?: string;
  challanDate?: string;
  weight?: number;
  freight?: number;
  caseNumber?: string;
  products?: Array<{
    name: string;
    quantity: number;
    unit: string;
    rate: number;
    gstRate: number;
    discountRate: number;
  }>;
}
If a field is not present, return null or leave it out. Only return the JSON object, nothing else.`
                     },
                    { type: "image_url", image_url: { url: `data:image/png;base64,${base64Image}` } }
                ]
            }
        ],
        max_tokens: 1024
    });
    // Parse the response (assuming the model returns JSON in the message content)
    const content = response.choices[0]?.message?.content || "{}";
    try {
        // First try direct parsing
        try {
            return JSON.parse(content);
        } catch {
            // If direct parsing fails, try cleaning the content
            const cleanContent = content
                // Remove any markdown code block syntax
                .replace(/```(?:json)?\n?/g, '')
                // Remove any leading/trailing whitespace
                .trim()
                // Remove any text before the first {
                .replace(/^[^{]*/, '')
                // Remove any text after the last }
                .replace(/[^}]*$/, '');
            
            return JSON.parse(cleanContent);
        }
    } catch (err) {
        // If all parsing attempts fail, return the raw content
        return { raw: content } as any;
    }
}