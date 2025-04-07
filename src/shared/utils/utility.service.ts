import { Injectable } from "@nestjs/common";
import { parsePhoneNumber } from "awesome-phonenumber";

@Injectable()
export class UtilityService {
  getPhoneNumberDetails(input: string) {
    const pn = parsePhoneNumber(input);

    if (!pn.valid) {
      return {
        isValid: false,
        error: "Invalid phone number format",
      };
    }

    return {
      isValid: true,
      input,
      country: {
        code: pn.regionCode,
        countryCode: pn.countryCode,
      },
      number: {
        e164: pn.number.e164,
        international: pn.number.international,
        national: pn.number.national,
        rfc3966: pn.number.rfc3966,
        significant: pn.number.significant,
      },
      type: pn.type,
      possible: pn.possible,
      canBeInternationallyDialled: pn.canBeInternationallyDialled,
    };
  }
}
