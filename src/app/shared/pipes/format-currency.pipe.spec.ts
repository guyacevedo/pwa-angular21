import { FormatCurrencyPipe } from './format-currency.pipe';

describe('FormatCurrencyPipe', () => {
  let pipe: FormatCurrencyPipe;

  beforeEach(() => {
    pipe = new FormatCurrencyPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return "$ 0" for null', () => {
    expect(pipe.transform(null)).toBe('$ 0');
  });

  it('should return "$ 0" for undefined', () => {
    expect(pipe.transform(undefined)).toBe('$ 0');
  });

  it('should format a positive number with Colombian locale', () => {
    const result = pipe.transform(1500000);
    // Should contain "1.500.000" or similar locale-formatted output
    expect(result).toContain('$');
    expect(result).toContain('1');
  });

  it('should format zero correctly', () => {
    expect(pipe.transform(0)).toBe('$ 0');
  });

  it('should format small numbers', () => {
    const result = pipe.transform(500);
    expect(result).toContain('$');
    expect(result).toContain('500');
  });

  it('should not include decimal fractions', () => {
    const result = pipe.transform(1234.56);
    // minimumFractionDigits = 0, maximumFractionDigits = 0
    expect(result).not.toContain('.56');
  });
});
