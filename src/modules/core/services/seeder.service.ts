import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";
import { Injectable, OnModuleInit } from "@nestjs/common";
import { Permission } from "@modules/core/entities/permission.entity";
import { Role } from "@modules/core/entities/role.entity";
import { RolePermission } from "@modules/core/entities/rolePermission.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Logger } from "@nestjs/common";
import { CountryService } from "@modules/country/services/country.service";
import { Country } from "../entities/country.entity";
import { CurrencyService } from "./currency.service";

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    private unitOfWork: UnitOfWork,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private readonly countryService: CountryService,
    private readonly currencyService: CurrencyService,
  ) {}

  async seedRolesAndPermissions() {
    await this.unitOfWork.executeInTransaction(async () => {
      const existingPermissions = await this.permissionRepository.find();

      if (existingPermissions.length > 0) {
        return;
      }

      this.logger.debug("Roles and permissions seeded successfully");
    });
  }

  async seedPermissions() {
    const permissions = [
      { name: "wallet.create", description: "Create wallet" },
      { name: "wallet.read", description: "Read wallet" },
      { name: "wallet.update", description: "Update wallet" },
      { name: "wallet.delete", description: "Delete wallet" },
      { name: "currency.create", description: "Create currency" },
      { name: "currency.read", description: "Read currency" },
      { name: "currency.update", description: "Update currency" },
      { name: "currency.delete", description: "Delete currency" },
      { name: "transaction.create", description: "Create transaction" },
      { name: "transaction.read", description: "Read transaction" },
      { name: "transaction.update", description: "Update transaction" },
      { name: "transaction.delete", description: "Delete transaction" },
    ];

    const createdPermissions = await Promise.all(
      permissions.map(async (permission) => {
        const existing = await this.permissionRepository.findOne({
          where: { action: permission.name },
        });
        if (!existing) {
          return this.permissionRepository.save(
            this.permissionRepository.create({
              action: permission.name,
              description: permission.description,
            }),
          );
        }
        return existing;
      }),
    );

    return createdPermissions;
  }

  async seedRoles(createdPermissions: Permission[]) {
    const roles = [
      {
        name: "super_admin",
        description: "Super Administrator with all permissions",
        permissions: createdPermissions,
      },
      {
        name: "admin",
        description: "Administrator with most permissions",
        permissions: createdPermissions.filter(
          (p) => !p.action.includes(".delete"),
        ),
      },
      {
        name: "user",
        description: "Regular user with basic permissions",
        permissions: createdPermissions.filter((p) =>
          p.action.includes(".read"),
        ),
      },
    ];

    await Promise.all(
      roles.map(async (role) => {
        const existing = await this.roleRepository.findOne({
          where: { name: role.name },
          relations: ["rolePermissions"],
        });

        if (!existing) {
          return this.roleRepository.save(
            this.roleRepository.create({
              name: role.name,
              description: role.description,
            }),
          );
        } else {
          if (existing.rolePermissions && existing.rolePermissions.length > 0) {
            await this.rolePermissionRepository.remove(
              existing.rolePermissions,
            );
          }

          const rolePermissions = await Promise.all(
            role.permissions.map(async (permission) => {
              const rolePermission = this.rolePermissionRepository.create();
              rolePermission.role = existing;
              rolePermission.permission = permission;
              return this.rolePermissionRepository.save(rolePermission);
            }),
          );

          existing.rolePermissions = rolePermissions;
          return this.roleRepository.save(existing);
        }
      }),
    );
  }

  async seedCountriesAndCurrency() {
    const countries = [
      {
        name: "Nigeria",
        phoneCode: "+234",
        isoAlphaTwoCode: "NG",
        isoAlphaThreeCode: "NGA",
        subdivisionLink: "https://en.wikipedia.org/wiki/States_of_Nigeria",
      },
      {
        name: "United Kingdom",
        phoneCode: "+44",
        isoAlphaTwoCode: "GB",
        isoAlphaThreeCode: "GBR",
        subdivisionLink:
          "https://en.wikipedia.org/wiki/Administrative_divisions_of_the_United_Kingdom",
      },
      {
        name: "United States of America",
        phoneCode: "+1",
        isoAlphaTwoCode: "US",
        isoAlphaThreeCode: "USA",
        subdivisionLink:
          "https://en.wikipedia.org/wiki/Administrative_divisions_of_the_United_States",
      },
    ];

    const currencies = [
      {
        name: "Naira",
        code: "NGN",
        symbol: "₦",
        rate: 1,
      },
      {
        name: "Pound Sterling",
        code: "GBP",
        symbol: "£",
        rate: 1,
      },
      {
        name: "Dollar",
        code: "USD",
        symbol: "$",
        rate: 1,
      },
    ];

    const createdCountries = await Promise.all(
      countries.map(async (country) => {
        const existingCountry = await this.countryService.findCountryByData({
          name: country.name,
        });

        if (existingCountry !== null) {
          return null;
        }
        return this.countryService.addCountry(country);
      }),
    );

    // Then create currencies with country IDs based on position
    await Promise.all(
      currencies.map(async (currency, index) => {
        const country = createdCountries[index];

        if (country === null) {
          return null;
        }

        const existingCurrency = await this.currencyService.getCurrencyByData({
          name: currency.name,
        });

        if (existingCurrency !== null) {
          return null;
        }

        return this.currencyService.createCurrency({
          ...currency,
          countryId: country.id,
        });
      }),
    );
  }

  async onModuleInit() {
    const existingPermissions = await this.permissionRepository.find();
    if (existingPermissions.length === 0) {
      const createdPermissions = await this.seedPermissions();
      await this.seedRoles(createdPermissions);
    }

    await this.seedCountriesAndCurrency();
  }
}
