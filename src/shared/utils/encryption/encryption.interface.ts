export interface EncryptionUtilInterface {
  encrypt(text: string): string;
  decrypt(text: string): string | boolean;
}
