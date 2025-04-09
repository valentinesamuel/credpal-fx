import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Permission } from "../entities/permission.entity";
import { Role } from "../entities/role.entity";
import { RolePermission } from "../entities/rolePermission.entity";
import { AppLogger } from "@shared/observability/logger";
import { CurrencyService } from "./currency.service";
import { CountryService } from "@modules/country/services/country.service";
import { UnitOfWork } from "@adapters/repositories/transactions/unitOfWork.trx";

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new AppLogger(SeederService.name);

  constructor(
    private unitOfWork: UnitOfWork,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
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
      { action: "wallet.create", description: "Create wallet" },
      { action: "wallet.read", description: "Read wallet" },
      { action: "wallet.update", description: "Update wallet" },
      { action: "wallet.delete", description: "Delete wallet" },
      { action: "currency.create", description: "Create currency" },
      { action: "currency.read", description: "Read currency" },
      { action: "currency.update", description: "Update currency" },
      { action: "currency.delete", description: "Delete currency" },
      { action: "transaction.create", description: "Create transaction" },
      { action: "transaction.read", description: "Read transaction" },
      { action: "transaction.update", description: "Update transaction" },
      { action: "transaction.delete", description: "Delete transaction" },
    ];

    for (const permission of permissions) {
      const exists = await this.permissionRepository.findOne({
        where: { action: permission.action },
      });

      if (!exists) {
        await this.permissionRepository.save(
          this.permissionRepository.create(permission),
        );
        this.logger.log(`Created permission: ${permission.action}`);
      }
    }
  }

  async seedRoles() {
    // First, get all created permissions
    const allPermissions = await this.permissionRepository.find();

    // Define role structures with permission names (not entities)
    const roleDefinitions = [
      {
        name: "user",
        description: "Regular user",
        permissionNames: [
          "wallet.read",
          "wallet.create",
          "wallet.update",
          "currency.read",
          "currency.create",
          "currency.update",
          "transaction.read",
          "transaction.create",
          "transaction.update",
        ],
      },
      {
        name: "admin",
        description: "Administrator",
        permissionNames: [
          "wallet.read",
          "wallet.create",
          "wallet.update",
          "wallet.delete",
          "currency.read",
          "currency.create",
          "currency.update",
          "currency.delete",
          "transaction.read",
          "transaction.create",
          "transaction.update",
          "transaction.delete",
        ],
      },
    ];

    for (const roleDef of roleDefinitions) {
      // Find existing role
      let role = await this.roleRepository.findOne({
        where: { name: roleDef.name },
        relations: ["rolePermissions", "rolePermissions.permission"],
      });

      if (!role) {
        role = this.roleRepository.create({
          name: roleDef.name,
          description: roleDef.description,
        });
        await this.roleRepository.save(role);
      } else {
        return this.roleRepository.save(
          this.roleRepository.create({
            name: role.name,
            description: role.description,
          }),
        );
      }

      if (role.rolePermissions && role.rolePermissions.length > 0) {
        await this.rolePermissionRepository.remove(role.rolePermissions);
      }

      const rolePermissions = await Promise.all(
        roleDef.permissionNames.map(async (permissionName) => {
          const permission = await this.permissionRepository.findOne({
            where: { action: permissionName },
          });
          if (!permission) {
            throw new Error(`Permission not found: ${permissionName}`);
          }
          const rolePermission = this.rolePermissionRepository.create();
          rolePermission.role = role;
          rolePermission.permission = permission;
          return this.rolePermissionRepository.save(rolePermission);
        }),
      );

      role.rolePermissions = rolePermissions;
      return this.roleRepository.save(role);
    }
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
      await this.seedRoles();
    }

    await this.seedCountriesAndCurrency();
  }
}
