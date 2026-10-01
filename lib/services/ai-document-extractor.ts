export interface DocumentExtractionResult {
  success: boolean;
  extractedData?: {
    companyName?: string;
    tradeLicenseNo?: string;
    establishedDate?: string;
    revenue?: number;
    expenses?: number;
    liabilities?: number;
    assetValue?: number;
    assetDescription?: string;
  };
  confidence?: number;
  error?: string;
}

export async function extractFromTradeLicense(
  fileBuffer: Buffer,
  fileName: string
): Promise<DocumentExtractionResult> {
  console.log('🤖 AI Document Extractor (Stub): Trade License');
  console.log('  File:', fileName);
  console.log('  Size:', fileBuffer.length, 'bytes');

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    extractedData: {
      companyName: 'Sample Company LLC',
      tradeLicenseNo: 'DED-123456-2021',
      establishedDate: '2021-01-15',
    },
    confidence: 0.95,
  };
}

export async function extractFromFinancialStatement(
  fileBuffer: Buffer,
  fileName: string
): Promise<DocumentExtractionResult> {
  console.log('🤖 AI Document Extractor (Stub): Financial Statement');
  console.log('  File:', fileName);

  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    success: true,
    extractedData: {
      revenue: 180000,
      expenses: 140000,
      liabilities: 300000,
    },
    confidence: 0.88,
  };
}

export async function extractFromAssetQuote(
  fileBuffer: Buffer,
  fileName: string
): Promise<DocumentExtractionResult> {
  console.log('🤖 AI Document Extractor (Stub): Asset Quote');
  console.log('  File:', fileName);

  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    extractedData: {
      assetDescription: 'Isuzu NPR 75P 16FT Box Truck',
      assetValue: 300000,
    },
    confidence: 0.92,
  };
}

export async function extractFromDocument(
  fileBuffer: Buffer,
  fileName: string,
  documentType: string
): Promise<DocumentExtractionResult> {
  console.log('🤖 AI Document Extractor (Stub)');
  console.log('  Document Type:', documentType);
  console.log('  File:', fileName);

  switch (documentType) {
    case 'TRADE_LICENSE':
      return extractFromTradeLicense(fileBuffer, fileName);
    case 'FINANCIAL_STATEMENT':
      return extractFromFinancialStatement(fileBuffer, fileName);
    case 'ASSET_QUOTE':
      return extractFromAssetQuote(fileBuffer, fileName);
    default:
      return {
        success: false,
        error: 'Unsupported document type for extraction',
      };
  }
}

export interface OCRResult {
  text: string;
  confidence: number;
  language: string;
}

export async function performOCR(
  fileBuffer: Buffer,
  fileName: string
): Promise<OCRResult> {
  console.log('🔍 AI OCR (Stub):', fileName);
  
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    text: 'Sample extracted text from document...',
    confidence: 0.91,
    language: 'en',
  };
}
