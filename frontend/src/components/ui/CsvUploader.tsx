import React, { useRef } from 'react';
import { Upload, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';
import { ImportResult } from '../../service/dataImportService';

interface CsvUploaderProps {
  title: string;
  description: string;
  onUpload: (file?: File) => Promise<ImportResult>;
  result?: ImportResult;
  importing: boolean;
  onImportingChange: (importing: boolean) => void;
  id: string;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  title,
  description,
  onUpload,
  result,
  importing,
  onImportingChange,
  id,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onImportingChange(true);
    try {
      const result = await onUpload(file);
      if (result.success && result.imported !== undefined) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
    } finally {
      onImportingChange(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDefaultImport = async () => {
    onImportingChange(true);
    try {
      const result = await onUpload();
      if (result.success && result.imported !== undefined) {
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Erro na importação:', error);
    } finally {
      onImportingChange(false);
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        disabled={importing}
        className="hidden"
        id={`${id}-file-input`}
      />
      <div className="space-y-2">
        <label
          htmlFor={`${id}-file-input`}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg cursor-pointer transition-all",
            importing
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-petrobras-blue hover:bg-blue-50"
          )}
        >
          {importing ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span className="text-sm font-medium">Importando...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Selecionar arquivo CSV</span>
            </>
          )}
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDefaultImport}
          disabled={importing}
          className="w-full"
        >
          Usar arquivo padrão
        </Button>
      </div>
    </>
  );
};

