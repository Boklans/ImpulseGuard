import { utcDayDiff } from './streak-date.utils';

describe('streak date utils', () => {
  it('treats two times on the same UTC day as zero days apart', () => {
    expect(
      utcDayDiff(
        new Date('2026-04-24T00:10:00.000Z'),
        new Date('2026-04-24T23:50:00.000Z'),
      ),
    ).toBe(0);
  });

  it('treats yesterday as one day apart across a short midnight gap', () => {
    expect(
      utcDayDiff(
        new Date('2026-04-23T23:59:00.000Z'),
        new Date('2026-04-24T00:01:00.000Z'),
      ),
    ).toBe(1);
  });

  it('detects a missed full calendar day', () => {
    expect(
      utcDayDiff(
        new Date('2026-04-22T12:00:00.000Z'),
        new Date('2026-04-24T00:00:00.000Z'),
      ),
    ).toBe(2);
  });
});

