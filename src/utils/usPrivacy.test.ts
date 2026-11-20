import { GppModel } from '@iabgpp/cmpapi';
import { describe, expect, it } from 'vitest';
import { readUSOptOut } from './usPrivacy';

describe('US opt-out from UMP', () => {
  it('leaves missing and unspecified choices unset', () => {
    expect(readUSOptOut(null)).toBeUndefined();
    const model = new GppModel();
    model.setFieldValue('usnat', 'SaleOptOut', 0);
    expect(readUSOptOut(model.encode())).toBeUndefined();
  });

  it('keeps a GPC opt-out even when a sale opt-out was declined', () => {
    const model = new GppModel();
    model.setFieldValue('usnat', 'SaleOptOut', 2);
    model.setFieldValue('usnat', 'Gpc', true);
    expect(readUSOptOut(model.encode())).toBe(true);
  });

  it('respects explicit choices and gives any opt-out precedence', () => {
    const model = new GppModel();
    model.setFieldValue('usnat', 'SaleOptOut', 2);
    expect(readUSOptOut(model.encode())).toBe(false);
    model.setFieldValue('usca', 'SharingOptOut', 1);
    expect(readUSOptOut(model.encode())).toBe(true);
  });
});
