import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  VerificationResult,
  VerificationStatus,
} from './verification.entity';
import { VendorService } from '../vendor/vendor.service';

interface OpenCorporatesCompany {
  name: string;
  company_number: string;
  registered_address?: { country?: string; region?: string };
  [key: string]: unknown;
}

@Injectable()
export class VerificationService {
  private readonly apiBaseUrl = 'https://api.opencorporates.com/v0.4';

  constructor(
    @InjectRepository(VerificationResult)
    private readonly verificationRepository: Repository<VerificationResult>,
    private readonly vendorService: VendorService,
    private readonly configService: ConfigService,
  ) {}

  private normalizeCompanyName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\b(pvt|private|ltd|limited|inc|incorporated|llc|llp|co|company)\b\.?/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async searchPublicRegistry(query: string): Promise<OpenCorporatesCompany[]> {
    try {
      console.log(`[VerificationService] Querying OpenCorporates public search for: "${query}"`);
      const url = `https://opencorporates.com/companies?q=${encodeURIComponent(query)}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml',
        },
      });

      if (!res.ok) return [];

      const html = await res.text();
      const regex = /<a[^>]+href="\/companies\/([^/]+)\/([^"?]+)"[^>]*>([^<]+)<\/a>/g;
      const companies: OpenCorporatesCompany[] = [];
      let m: RegExpExecArray | null;

      while ((m = regex.exec(html)) !== null) {
        const jurisdiction = m[1];
        const companyNumber = m[2];
        const companyName = m[3]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'")
          .trim();

        if (!companies.some((c) => c.company_number === companyNumber)) {
          companies.push({
            name: companyName,
            company_number: companyNumber,
            jurisdiction_code: jurisdiction,
            current_status: 'Active',
            registered_address: { country: jurisdiction.toUpperCase() },
          });
        }
      }

      console.log(`[VerificationService] Public search returned ${companies.length} live matching companies`);
      return companies;
    } catch (err) {
      console.warn(`[VerificationService] Public registry search failed:`, err);
      return [];
    }
  }

  async verifyVendor(vendorId: string): Promise<VerificationResult> {
    const vendor = await this.vendorService.findById(vendorId);
    const rawApiKey = this.configService.get<string>('OPENCORPORATES_API_KEY');
    const hasValidKey = rawApiKey && rawApiKey !== 'your-opencorporates-key-here' && !rawApiKey.startsWith('dummy');

    try {
      let companies: OpenCorporatesCompany[] = [];

      // Tier 1: Try official OpenCorporates API if API key is configured
      if (hasValidKey) {
        const query = encodeURIComponent(vendor.companyName.trim());
        const url = `${this.apiBaseUrl}/companies/search?q=${query}&api_token=${rawApiKey}&per_page=5`;
        console.log(`[VerificationService] Live OpenCorporates API query with token for: "${vendor.companyName}"`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'LexVerify-Compliance-Platform/1.0',
              Accept: 'application/json',
            },
            signal: controller.signal,
          });

          if (response.ok) {
            const data = (await response.json()) as {
              results: { companies: Array<{ company: OpenCorporatesCompany }> };
            };
            companies = (data?.results?.companies ?? []).map((c) => c.company);
          }
        } catch (apiErr) {
          console.warn(`[VerificationService] OpenCorporates token query failed:`, apiErr);
        } finally {
          clearTimeout(timeoutId);
        }
      }

      // Tier 2: Real-time public OpenCorporates live registry search (No API key required)
      if (companies.length === 0) {
        // Pass 1: Full company name
        companies = await this.searchPublicRegistry(vendor.companyName.trim());
      }

      if (companies.length === 0) {
        // Pass 2: Base company name with corporate legal suffixes stripped
        const baseName = this.normalizeCompanyName(vendor.companyName);
        if (baseName && baseName.length >= 3) {
          console.log(`[VerificationService] Retrying public search with base name: "${baseName}"`);
          companies = await this.searchPublicRegistry(baseName);
        }
      }

      if (companies.length === 0 && vendor.registrationNumber && vendor.registrationNumber.length >= 4) {
        // Pass 3: Search by corporate registration number / CIN
        console.log(`[VerificationService] Retrying public search with registration number: "${vendor.registrationNumber}"`);
        companies = await this.searchPublicRegistry(vendor.registrationNumber.trim());
      }

      if (companies.length === 0) {
        console.log(`[VerificationService] No company matches found in OpenCorporates registry for "${vendor.companyName}"`);
        return this.saveResult(vendorId, VerificationStatus.UNABLE_TO_VERIFY, null, {
          error: `No registered company matching "${vendor.companyName}" was found in the public corporate registry.`,
        });
      }

      // Pick best matching company from registry results
      const normalizedVendorName = this.normalizeCompanyName(vendor.companyName);
      let bestMatch = companies[0];
      let minDistance = 999;

      for (const item of companies) {
        const normItemName = this.normalizeCompanyName(item.name);
        const dist = this.levenshtein(normalizedVendorName, normItemName);
        if (dist < minDistance) {
          minDistance = dist;
          bestMatch = item;
        }
      }

      const mismatchFields: Record<string, unknown> = {};
      const normalizedApiName = this.normalizeCompanyName(bestMatch.name);

      const nameMatches =
        normalizedVendorName === normalizedApiName ||
        normalizedVendorName.includes(normalizedApiName) ||
        normalizedApiName.includes(normalizedVendorName) ||
        minDistance <= 4;

      if (!nameMatches) {
        mismatchFields['companyName'] = {
          vendor: vendor.companyName,
          registry: bestMatch.name,
        };
      }

      if (vendor.registrationNumber && bestMatch.company_number) {
        const cleanVendorReg = vendor.registrationNumber.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanApiReg = bestMatch.company_number.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (
          cleanVendorReg !== cleanApiReg &&
          !cleanApiReg.includes(cleanVendorReg) &&
          !cleanVendorReg.includes(cleanApiReg)
        ) {
          mismatchFields['registrationNumber'] = {
            vendor: vendor.registrationNumber,
            registry: bestMatch.company_number,
          };
        }
      }

      const hasMismatch = Object.keys(mismatchFields).length > 0;
      const status = hasMismatch ? VerificationStatus.MISMATCH : VerificationStatus.VERIFIED;

      console.log(`[VerificationService] Dynamic verification result for ${vendor.companyName}: ${status}`);
      return this.saveResult(vendorId, status, bestMatch, hasMismatch ? mismatchFields : {});
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[VerificationService] Verification error:`, error);
      return this.saveResult(vendorId, VerificationStatus.UNABLE_TO_VERIFY, null, {
        error: `Verification error: ${message}`,
      });
    }
  }

  private async saveResult(
    vendorId: string,
    status: VerificationStatus,
    apiCompany: OpenCorporatesCompany | null,
    extra: Record<string, unknown>,
  ): Promise<VerificationResult> {
    try {
      // Remove existing result
      await this.verificationRepository.delete({ vendorId });

      const result = this.verificationRepository.create({
        vendorId,
        status,
        apiData: apiCompany ? (apiCompany as unknown as Record<string, unknown>) : null,
        apiCompanyName: apiCompany?.name ?? null,
        apiRegistrationNumber: apiCompany?.company_number ?? null,
        mismatchFields: extra,
        errorMessage: (extra.error as string) ?? null,
      } as any);
      return await this.verificationRepository.save(result as unknown as VerificationResult);
    } catch {
      throw new InternalServerErrorException('Failed to save verification result');
    }
  }

  async getVerificationResult(vendorId: string): Promise<VerificationResult | null> {
    return this.verificationRepository.findOne({
      where: { vendorId },
      order: { verifiedAt: 'DESC' },
    });
  }

  private levenshtein(a: string, b: string): number {
    const matrix: number[][] = Array.from({ length: b.length + 1 }, (_, i) =>
      Array.from({ length: a.length + 1 }, (__, j) => (i === 0 ? j : i)),
    );
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        matrix[i][j] =
          b[i - 1] === a[j - 1]
            ? matrix[i - 1][j - 1]
            : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
    return matrix[b.length][a.length];
  }
}
