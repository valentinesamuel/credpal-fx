import { Injectable, Logger } from "@nestjs/common";
import * as crypto from "crypto";
import { EncryptionUtilInterface } from "./encryption.interface";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EncryptionUtil implements EncryptionUtilInterface {
  private readonly logger = new Logger(EncryptionUtil.name);
  private readonly algorithm: string;
  private readonly key: Buffer;
  private readonly ivLength = 12; // GCM mode requires 12 bytes IV

  constructor(private readonly configService: ConfigService) {
    // Generate a random key (or load it from a secure location)
    this.algorithm = this.configService.get<string>(
      "common.encryption.algorithm",
    );
    this.key = Buffer.from(
      this.configService.get<string>("common.encryption.key"),
    );
  }

  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength); // Generate a random IV
    const cipher: any = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag();

    return `${encrypted}:rn${authTag.toString("hex")}:rn${iv.toString("hex")}`;
  }

  decrypt(text: string): string {
    const [encryptedData, authTag, iv] = text.split(":rn");
    const decipher: any = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTag, "hex"));

    let decrypted = decipher.update(encryptedData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
