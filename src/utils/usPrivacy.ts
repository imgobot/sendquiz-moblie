import { GppModel } from '@iabgpp/cmpapi';

// GPP uses 1 for opted out, 2 for explicitly not opted out, and 0 for unspecified.
export function readUSOptOut(encoded: string | null): boolean | undefined {
  if (!encoded) return undefined;
  const sections: Record<string, Record<string, unknown>> = new GppModel(encoded).toObject();
  let hasChoice = false;

  for (const [name, section] of Object.entries(sections)) {
    if (!name.startsWith('us')) continue;
    const choices = [section.SaleOptOut, section.SharingOptOut, section.TargetedAdvertisingOptOut];
    if (section.Gpc === true || section.OptOutSale === 'Y' || choices.includes(1)) return true;
    if (section.OptOutSale === 'N' || choices.includes(2)) hasChoice = true;
  }
  return hasChoice ? false : undefined;
}
