import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { extractInvoiceData } from '@/services/invoice-extraction';
import { ExtractedInvoiceData } from '@/interfaces';

interface InvoiceUploaderProps {
  onDataExtracted: (data: ExtractedInvoiceData, file?: File) => void;
  onError: (error: string) => void;
}

export function InvoiceUploader({ onDataExtracted, onError }: InvoiceUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      if (acceptedFiles.length === 0) return;

      setIsLoading(true);
      const file = acceptedFiles[0];
      const data = await extractInvoiceData(file);
      onDataExtracted(data, file);
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [onDataExtracted, onError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Processing invoice...</p>
          </div>
        ) : (
          <>
            <div className="text-4xl">📄</div>
            {isDragActive ? (
              <p>Drop the invoice image here...</p>
            ) : (
              <>
                <p>Drag & drop an invoice image here, or click to select</p>
                <Button variant="outline" type="button">
                  Select Image
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
