import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';

// In-memory mock database fallback for development/offline mode
interface InMemoryClient {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName?: string;
  taxId: string;
  country: string;
  region?: string;
  industry?: string;
  website?: string;
  status: string;
  billing: any;
  contacts: any[];
  planConfig: any;
  createdAt: string;
}

@Injectable()
export class ClientsService {
  private mockClients: InMemoryClient[] = [
    {
      id: 'client-uuid-1',
      tenantId: '770e8400-e29b-41d4-a716-446655440001',
      legalName: 'Tech Solutions S.A. de C.V.',
      tradeName: 'TechSol',
      taxId: 'TSO210315AB9',
      country: 'MEX',
      region: 'latam',
      industry: 'technology',
      website: 'https://techsol.mx',
      status: 'active',
      billing: {
        billingEmail: 'facturacion@techsol.mx',
        billingAddress: 'Av. Reforma 505, Piso 12',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '06600',
        country: 'MEX',
        currency: 'MXN',
        paymentMethod: 'bank_transfer',
      },
      contacts: [
        {
          id: 'contact-1',
          firstName: 'María',
          lastName: 'López',
          email: 'maria@techsol.mx',
          phone: '+52 55 1234 5678',
          role: 'primary',
          isPrimary: true,
        },
      ],
      planConfig: {
        planName: 'professional',
        userLimit: 25,
        storageLimitGb: 100,
        startedAt: '2026-08-01',
        isTrial: false,
        trialDays: 0,
      },
      createdAt: new Date().toISOString(),
    },
  ];

  constructor(private readonly prisma: PrismaService) {}

  async checkTaxId(tenantId: string, taxId: string, excludeClientId?: string): Promise<{ exists: boolean; clientName?: string }> {
    try {
      const client = await this.prisma.client.findFirst({
        where: {
          taxId,
          tenantId,
          NOT: excludeClientId ? { id: excludeClientId } : undefined,
        },
      });
      if (client) {
        return { exists: true, clientName: client.legalName };
      }
    } catch {
      // Fallback to in-memory mock check
      const client = this.mockClients.find(
        (c) => c.taxId === taxId && c.tenantId === tenantId && c.id !== excludeClientId
      );
      if (client) {
        return { exists: true, clientName: client.legalName };
      }
    }
    return { exists: false };
  }

  async checkDomain(tenantId: string, domain: string, excludeClientId?: string): Promise<{ exists: boolean; clientName?: string }> {
    try {
      // Search client billing email domains in the database
      const billing = await this.prisma.clientBilling.findFirst({
        where: {
          billingEmail: { endsWith: `@${domain}` },
          client: {
            tenantId,
            NOT: excludeClientId ? { id: excludeClientId } : undefined,
          },
        },
        include: { client: true },
      });
      if (billing) {
        return { exists: true, clientName: billing.client.legalName };
      }
    } catch {
      // Fallback to in-memory mock check
      const matchedClient = this.mockClients.find(
        (c) =>
          c.tenantId === tenantId &&
          c.id !== excludeClientId &&
          (c.billing.billingEmail.endsWith(`@${domain}`) ||
            c.contacts.some((ct) => ct.email.endsWith(`@${domain}`)))
      );
      if (matchedClient) {
        return { exists: true, clientName: matchedClient.legalName };
      }
    }
    return { exists: false };
  }

  async findAll(tenantId: string): Promise<any[]> {
    try {
      return await this.prisma.client.findMany({
        where: { tenantId },
        include: {
          billing: true,
          contacts: true,
          planConfig: true,
        },
      });
    } catch {
      return this.mockClients.filter((c) => c.tenantId === tenantId);
    }
  }

  async findOne(id: string, tenantId: string): Promise<any> {
    try {
      const client = await this.prisma.client.findFirst({
        where: { id, tenantId },
        include: {
          billing: true,
          contacts: true,
          planConfig: true,
        },
      });
      if (!client) throw new NotFoundException('Cliente no encontrado');
      return client;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      const client = this.mockClients.find((c) => c.id === id && c.tenantId === tenantId);
      if (!client) throw new NotFoundException('Cliente no encontrado');
      return client;
    }
  }

  async create(tenantId: string, dto: CreateClientDto): Promise<any> {
    const taxCheck = await this.checkTaxId(tenantId, dto.company.taxId);
    if (taxCheck.exists) {
      throw new ConflictException(`Ya existe un cliente con el ID Fiscal '${dto.company.taxId}'`);
    }

    try {
      // 1. Prisma Transaction to persist all details safely
      return await this.prisma.$transaction(async (tx) => {
        const client = await tx.client.create({
          data: {
            tenantId,
            legalName: dto.company.legalName,
            tradeName: dto.company.tradeName,
            taxId: dto.company.taxId,
            country: dto.company.country,
            region: dto.company.region,
            industry: dto.company.industry,
            website: dto.company.website,
            status: 'active',
          },
        });

        await tx.clientBilling.create({
          data: {
            clientId: client.id,
            billingEmail: dto.billing.billingEmail,
            billingAddress: dto.billing.billingAddress,
            city: dto.billing.city,
            state: dto.billing.state,
            postalCode: dto.billing.postalCode,
            country: dto.billing.country,
            currency: dto.billing.currency,
            paymentMethod: dto.billing.paymentMethod || 'bank_transfer',
          },
        });

        await tx.clientPlanConfig.create({
          data: {
            clientId: client.id,
            planName: dto.planConfig.planName,
            userLimit: dto.planConfig.userLimit,
            storageLimitGb: dto.planConfig.storageLimitGb,
            startedAt: new Date(dto.planConfig.startedAt),
            isTrial: dto.planConfig.isTrial || false,
            trialDays: dto.planConfig.trialDays || 0,
            trialEndsAt: dto.planConfig.isTrial
              ? new Date(Date.now() + (dto.planConfig.trialDays || 14) * 24 * 60 * 60 * 1000)
              : null,
          },
        });

        // Insert contacts
        if (dto.contacts && dto.contacts.length > 0) {
          await tx.clientContact.createMany({
            data: dto.contacts.map((contact) => ({
              clientId: client.id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              role: contact.role,
              isPrimary: contact.isPrimary || false,
            })),
          });
        }

        return tx.client.findUnique({
          where: { id: client.id },
          include: {
            billing: true,
            contacts: true,
            planConfig: true,
          },
        });
      });
    } catch (err) {
      console.warn('⚠️ Database transaction failed. Registering client in offline mode memory.', err.message);

      // In-memory mock database insertion
      const newClient: InMemoryClient = {
        id: `client-uuid-${Date.now()}`,
        tenantId,
        legalName: dto.company.legalName,
        tradeName: dto.company.tradeName,
        taxId: dto.company.taxId,
        country: dto.company.country,
        region: dto.company.region,
        industry: dto.company.industry,
        website: dto.company.website,
        status: 'active',
        billing: { ...dto.billing },
        contacts: dto.contacts.map((c, i) => ({ id: `contact-${i}-${Date.now()}`, ...c })),
        planConfig: { ...dto.planConfig },
        createdAt: new Date().toISOString(),
      };

      this.mockClients.push(newClient);
      return newClient;
    }
  }

  async update(id: string, tenantId: string, dto: CreateClientDto): Promise<any> {
    const taxCheck = await this.checkTaxId(tenantId, dto.company.taxId, id);
    if (taxCheck.exists) {
      throw new ConflictException(`Ya existe un cliente con el ID Fiscal '${dto.company.taxId}'`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const client = await tx.client.findFirst({
          where: { id, tenantId },
        });
        if (!client) throw new NotFoundException('Cliente no encontrado');

        await tx.client.update({
          where: { id },
          data: {
            legalName: dto.company.legalName,
            tradeName: dto.company.tradeName,
            taxId: dto.company.taxId,
            country: dto.company.country,
            region: dto.company.region,
            industry: dto.company.industry,
            website: dto.company.website,
          },
        });

        await tx.clientBilling.update({
          where: { clientId: id },
          data: {
            billingEmail: dto.billing.billingEmail,
            billingAddress: dto.billing.billingAddress,
            city: dto.billing.city,
            state: dto.billing.state,
            postalCode: dto.billing.postalCode,
            country: dto.billing.country,
            currency: dto.billing.currency,
            paymentMethod: dto.billing.paymentMethod || 'bank_transfer',
          },
        });

        await tx.clientPlanConfig.update({
          where: { clientId: id },
          data: {
            planName: dto.planConfig.planName,
            userLimit: dto.planConfig.userLimit,
            storageLimitGb: dto.planConfig.storageLimitGb,
            startedAt: new Date(dto.planConfig.startedAt),
            isTrial: dto.planConfig.isTrial || false,
            trialDays: dto.planConfig.trialDays || 0,
          },
        });

        // Recreate contacts simple approach: delete and insert
        await tx.clientContact.deleteMany({ where: { clientId: id } });
        if (dto.contacts && dto.contacts.length > 0) {
          await tx.clientContact.createMany({
            data: dto.contacts.map((contact) => ({
              clientId: id,
              firstName: contact.firstName,
              lastName: contact.lastName,
              email: contact.email,
              phone: contact.phone,
              role: contact.role,
              isPrimary: contact.isPrimary || false,
            })),
          });
        }

        return tx.client.findUnique({
          where: { id },
          include: {
            billing: true,
            contacts: true,
            planConfig: true,
          },
        });
      });
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      console.warn('⚠️ Database transaction failed. Updating client in offline mode memory.', err.message);

      const clientIndex = this.mockClients.findIndex((c) => c.id === id && c.tenantId === tenantId);
      if (clientIndex === -1) throw new NotFoundException('Cliente no encontrado');

      this.mockClients[clientIndex] = {
        ...this.mockClients[clientIndex],
        legalName: dto.company.legalName,
        tradeName: dto.company.tradeName,
        taxId: dto.company.taxId,
        country: dto.company.country,
        region: dto.company.region,
        industry: dto.company.industry,
        website: dto.company.website,
        billing: { ...dto.billing },
        contacts: dto.contacts.map((c, i) => ({ id: `contact-${i}-${Date.now()}`, ...c })),
        planConfig: { ...dto.planConfig },
      };

      return this.mockClients[clientIndex];
    }
  }

  async remove(id: string, tenantId: string): Promise<{ success: boolean }> {
    try {
      const client = await this.prisma.client.findFirst({
        where: { id, tenantId },
      });
      if (!client) throw new NotFoundException('Cliente no encontrado');

      await this.prisma.client.delete({ where: { id } });
      return { success: true };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      const clientIndex = this.mockClients.findIndex((c) => c.id === id && c.tenantId === tenantId);
      if (clientIndex === -1) throw new NotFoundException('Cliente no encontrado');

      this.mockClients.splice(clientIndex, 1);
      return { success: true };
    }
  }
}
