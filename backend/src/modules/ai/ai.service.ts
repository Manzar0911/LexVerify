import {
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as Tesseract from 'tesseract.js';
import * as pdfParse from 'pdf-parse';
import * as fs from 'fs';
import { DocumentService } from '../document/document.service';

export interface ExtractedFields {
  companyName: string | null;
  registrationNumber: string | null;
  gstNumber: string | null;
  address: string | null;
  bankAccountNumber: string | null;
  ifscCode: string | null;
}

export type ComparisonStatus = 'MATCH' | 'MISMATCH' | 'MISSING';

export interface ComparisonEntry {
  fieldName: string;
  values: Record<string, string | null>;
  status: ComparisonStatus;
}

@Injectable()
export class AiService {
  private readonly openai: OpenAI;
  private readonly gemini: GoogleGenerativeAI | null = null;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => DocumentService))
    private readonly documentService: DocumentService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY') || 'none',
    });

    const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (geminiKey && geminiKey.length > 10) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
  }

  private buildExtractionPrompt(): string {
    return `You are an accurate corporate document verification analyzer.
Extract the following structured attributes from this document image/file.
Return ONLY a valid raw JSON object with exactly these keys:
{
  "companyName": string or null,
  "registrationNumber": string or null,
  "gstNumber": string or null,
  "address": string or null,
  "bankAccountNumber": string or null,
  "ifscCode": string or null
}

Strict Rules:
- If a field is not present in the document, set its value to null.
- Extract the exact company name, corporate identification number (CIN/registration), GST identification number (GSTIN), full address, bank account number, and IFSC code as printed.
- Do NOT include markdown code fences, comments, or extra text. Return ONLY the JSON object.`;
  }

  private parseAiResponse(content: string): ExtractedFields {
    try {
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        companyName: parsed.companyName ?? null,
        registrationNumber: parsed.registrationNumber ?? null,
        gstNumber: parsed.gstNumber ?? null,
        address: parsed.address ?? null,
        bankAccountNumber: parsed.bankAccountNumber ?? null,
        ifscCode: parsed.ifscCode ?? null,
      };
    } catch {
      return {
        companyName: null,
        registrationNumber: null,
        gstNumber: null,
        address: null,
        bankAccountNumber: null,
        ifscCode: null,
      };
    }
  }

  // Dynamic Real-Time OCR and Document Text Entity Extraction
  private extractFieldsFromDocumentText(rawText: string): ExtractedFields {
    console.log(`[AiService] Performing dynamic entity extraction on document text (${rawText.length} chars)`);
    const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    const getNextLineAfter = (pattern: RegExp): string | null => {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          // Check if value is on the same line after colon, dash or label
          const inline = lines[i].replace(pattern, '').replace(/^[:\s\-]+/, '').trim();
          if (inline.length > 0) return inline;
          // Check next line
          if (i + 1 < lines.length) return lines[i + 1];
        }
      }
      return null;
    };

    // 1. Company Name
    let companyName = getNextLineAfter(/^(?:COMPANY\s*NAME|ACCOUNT\s*HOLDER(?:\s*\/\s*COMPANY\s*NAME)?|BUSINESS\s*NAME|NAME\s*OF\s*(?:THE\s*)?COMPANY)[:\s\-]*$/i);
    if (!companyName) {
      for (const l of lines) {
        if (
          /\b(Pvt\s*Ltd|Private\s*Limited|LLC|Inc\b|Corporation|Corp\b|Solutions\s*Pvt|Technologies)\b/i.test(l) &&
          !/^(CERTIFICATE|MINISTRY|GOVERNMENT|GOODS|COMMERCIAL|DEPARTMENT)/i.test(l)
        ) {
          companyName = l.replace(/^M\/s\.?\s*/i, '').trim();
          break;
        }
      }
    }

    // 2. CIN / Corporate Registration Number
    let cin = getNextLineAfter(/^(?:CORPORATE\s*REGISTRATION\s*NUMBER(?:\s*\(CIN\))?|REGISTRATION\s*NUMBER(?:\s*\(CIN\))?|CIN|COMPANY\s*REGISTRATION\s*NO)[:\s\-]*$/i);
    if (!cin || !/^[A-Z0-9\-]+$/i.test(cin)) {
      const m = rawText.match(/\b([LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6})\b/i);
      cin = m ? m[1] : (cin && cin.length >= 6 ? cin : null);
    }

    // 3. GSTIN / Tax Identification Number
    let gst = getNextLineAfter(/^(?:GST\s*IDENTIFICATION\s*NUMBER(?:\s*\(GSTIN\))?|GSTIN|GST\s*NUMBER|TAX\s*ID)[:\s\-]*$/i);
    if (!gst || !/^[0-9A-Z]{15}$/i.test(gst)) {
      const m = rawText.match(/\b([0-9]{2}[A-Z0-9]{5}[0-9]{4}[A-Z0-9]{1}[1-9A-Z0-9]{1}[Zz0-9][0-9A-Z0-9]{1})\b/);
      gst = m ? m[1] : (gst && gst.length >= 10 ? gst : null);
    }

    // 4. Bank Account Number
    let bankAccount = getNextLineAfter(/^(?:BANK\s*ACCOUNT\s*NUMBER|ACCOUNT\s*NUMBER|A\/C\s*NO)[:\s\-]*$/i);
    if (!bankAccount || !/^[0-9]{9,18}$/.test(bankAccount)) {
      const m = rawText.match(/(?:Account\s*(?:No|Number)|A\/C\s*No)[:\s\-]+([0-9]{9,18})/i);
      bankAccount = m ? m[1] : (bankAccount && /^[0-9]{9,18}$/.test(bankAccount) ? bankAccount : null);
    }

    // 5. Bank IFSC Code
    let ifsc = getNextLineAfter(/^(?:BANK\s*IFSC\s*CODE|IFSC\s*CODE|IFSC)[:\s\-]*$/i);
    if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
      const m = rawText.match(/\b([A-Z]{4}0[A-Z0-9]{6})\b/i);
      ifsc = m ? m[1] : (ifsc && /^[A-Z0-9]{11}$/i.test(ifsc) ? ifsc : null);
    }

    // 6. Address
    const address = getNextLineAfter(/^(?:REGISTERED\s*ADDRESS|PRINCIPAL\s*PLACE\s*OF\s*BUSINESS|BRANCH\s*ADDRESS|ADDRESS)[:\s\-]*$/i);

    return {
      companyName: companyName ? companyName.trim() : null,
      registrationNumber: cin ? cin.trim() : null,
      gstNumber: gst ? gst.trim() : null,
      address: address ? address.trim() : null,
      bankAccountNumber: bankAccount ? bankAccount.trim() : null,
      ifscCode: ifsc ? ifsc.trim() : null,
    };
  }

  async extractDocument(documentId: string): Promise<ExtractedFields> {
    const document = await this.documentService.findById(documentId);

    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundException('Document file not found on disk');
    }

    let extracted: ExtractedFields | null = null;
    const rawApiKey = this.configService.get<string>('OPENAI_API_KEY');
    const hasOpenAiKey = rawApiKey && !rawApiKey.startsWith('dummy') && rawApiKey.startsWith('sk-') && rawApiKey.length > 20;

    // Tier 1A: OpenAI Vision (If active API key with quota is provided)
    if (hasOpenAiKey) {
      try {
        console.log(`[AiService] Running OpenAI multi-modal vision extraction on ${document.fileName}...`);
        const fileBuffer = fs.readFileSync(document.filePath);
        const base64 = fileBuffer.toString('base64');
        const mediaType = document.mimeType === 'application/pdf'
          ? 'image/jpeg'
          : (document.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp');

        const response = await this.openai.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mediaType};base64,${base64}`,
                    detail: 'high',
                  },
                },
                {
                  type: 'text',
                  text: this.buildExtractionPrompt(),
                },
              ],
            },
          ],
        }, { timeout: 12000 });

        const content = response.choices[0]?.message?.content ?? '{}';
        extracted = this.parseAiResponse(content);
        console.log(`[AiService] OpenAI extraction completed:`, extracted);
      } catch (err) {
        console.warn(`[AiService] OpenAI API unavailable (${err instanceof Error ? err.message : err}). Falling back to dynamic on-device OCR/parsing.`);
      }
    }

    // Tier 1B: Google Gemini Vision (if configured)
    if ((!extracted || Object.values(extracted).every((v) => v === null)) && this.gemini) {
      try {
        console.log(`[AiService] Running Gemini 1.5 Flash vision extraction...`);
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const fileBuffer = fs.readFileSync(document.filePath);
        const resolvedMime = document.mimeType === 'application/pdf' ? 'image/jpeg' : (document.mimeType || 'image/jpeg');
        const imagePart = {
          inlineData: {
            data: fileBuffer.toString('base64'),
            mimeType: resolvedMime,
          },
        };

        const result = await model.generateContent([this.buildExtractionPrompt(), imagePart as any]);
        const textResp = result.response.text();
        extracted = this.parseAiResponse(textResp);
        console.log(`[AiService] Gemini extraction completed:`, extracted);
      } catch (geminiErr) {
        console.warn(`[AiService] Gemini extraction unavailable:`, geminiErr);
      }
    }

    // Tier 2: Dynamic PDF text stream extraction (if PDF)
    if ((!extracted || Object.values(extracted).every((v) => v === null)) && document.mimeType === 'application/pdf') {
      try {
        console.log(`[AiService] Extracting dynamic text from PDF ${document.fileName}...`);
        const fileBuffer = fs.readFileSync(document.filePath);
        const parser = typeof pdfParse === 'function' ? pdfParse : (pdfParse as any).default || pdfParse;
        const pdfData = await parser(fileBuffer);
        if (pdfData && pdfData.text && pdfData.text.trim().length > 10) {
          console.log(`[AiService] PDF text extracted (${pdfData.text.length} chars)`);
          extracted = this.extractFieldsFromDocumentText(pdfData.text);
        }
      } catch (pdfErr) {
        console.warn(`[AiService] PDF text stream extraction failed:`, pdfErr);
      }
    }

    // Tier 3: Real-time dynamic OCR with Tesseract.js directly from document file
    const hasValidFields = extracted && Object.values(extracted).some((v) => v !== null && v !== '');
    if (!hasValidFields) {
      try {
        console.log(`[AiService] Running real-time dynamic Tesseract OCR engine on ${document.fileName}...`);
        const { data: { text } } = await Tesseract.recognize(
          document.filePath,
          'eng',
          { logger: () => {} }
        );
        console.log(`[AiService] Dynamic OCR extracted raw text (${text.length} chars)`);
        extracted = this.extractFieldsFromDocumentText(text);
      } catch (ocrErr) {
        console.warn(`[AiService] Dynamic OCR parsing failed:`, ocrErr);
      }
    }

    // If still null, return empty structure (pure nulls, zero dummy values)
    if (!extracted) {
      extracted = {
        companyName: null,
        registrationNumber: null,
        gstNumber: null,
        address: null,
        bankAccountNumber: null,
        ifscCode: null,
      };
    }

    // Save extracted records to PostgreSQL database
    const fieldEntries = Object.entries(extracted).map(([fieldName, extractedValue]) => ({
      fieldName,
      extractedValue: extractedValue as string | null,
    }));
    await this.documentService.saveExtractedData(documentId, fieldEntries);
    console.log(`[AiService] Successfully saved ${fieldEntries.length} dynamic extracted fields for document ${documentId}`);

    return extracted;
  }


  async compareDocuments(vendorId: string): Promise<ComparisonEntry[]> {
    const documents = await this.documentService.findByVendor(vendorId);
    if (documents.length === 0) return [];

    const FIELD_NAMES = [
      'companyName',
      'registrationNumber',
      'gstNumber',
      'address',
      'bankAccountNumber',
      'ifscCode',
    ];

    // Collect extracted data per document
    const dataByDoc: Record<string, Record<string, string | null>> = {};
    for (const doc of documents) {
      const fields = await this.documentService.getExtractedData(doc.id);
      const fieldMap: Record<string, string | null> = {};
      for (const f of fields) {
        fieldMap[f.fieldName] = f.editedValue ?? f.extractedValue;
      }
      dataByDoc[doc.documentType] = fieldMap;
    }

    return FIELD_NAMES.map((fieldName) => {
      const values: Record<string, string | null> = {};
      for (const [docType, fields] of Object.entries(dataByDoc)) {
        values[docType] = fields[fieldName] ?? null;
      }

      const nonNullValues = Object.values(values).filter((v) => v !== null);
      let status: ComparisonStatus;

      if (nonNullValues.length === 0) {
        status = 'MISSING';
      } else if (nonNullValues.length === 1) {
        status = 'MATCH';
      } else {
        // Compare all non-null values (case-insensitive + fuzzy)
        const normalized = nonNullValues.map((v) =>
          v!.toLowerCase().replace(/\s+/g, ' ').trim(),
        );
        const allMatch = normalized.every((v) =>
          this.fuzzyMatch(v, normalized[0]),
        );
        status = allMatch ? 'MATCH' : 'MISMATCH';
      }

      return { fieldName, values, status };
    });
  }

  private fuzzyMatch(a: string, b: string): boolean {
    if (a === b) return true;
    return this.levenshtein(a, b) <= 3;
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = [];
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}
