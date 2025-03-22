import { describe, expect, it } from 'vitest';
import { truncateName, unscream } from '../../src/utils/text';

describe('truncateName', () => {
  it('should truncate the name if it exceeds the maxLength', () => {
    const name = 'ThisIsAVeryLongName';
    const maxLength = 10;
    const result = truncateName(name, maxLength);
    expect(result).toBe('ThisIsAVer...');
  });

  it('should not truncate the name if it does not exceed the maxLength', () => {
    const name = 'ShortName';
    const maxLength = 10;
    const result = truncateName(name, maxLength);
    expect(result).toBe('ShortName');
  });

  it('should return the original name if the length is exactly maxLength', () => {
    const name = 'ExactLength';
    const maxLength = 11;
    const result = truncateName(name, maxLength);
    expect(result).toBe('ExactLength');
  });

  it('should handle empty string input', () => {
    const name = '';
    const maxLength = 5;
    const result = truncateName(name, maxLength);
    expect(result).toBe('');
  });

  it('should handle maxLength of 0', () => {
    const name = 'NonEmpty';
    const maxLength = 0;
    const result = truncateName(name, maxLength);
    expect(result).toBe('...');
  });
});

describe('unscream', () => {
  it('should convert uppercase letters to lowercase and replace underscores with spaces', () => {
    const input = 'THIS_IS_A_TEST';
    const result = unscream(input);
    expect(result).toBe('This Is A Test');
  });

  it('should handle input with no underscores', () => {
    const input = 'THISISATEST';
    const result = unscream(input);
    expect(result).toBe('Thisisatest');
  });

  it('should handle input with mixed case and underscores', () => {
    const input = 'ThIs_Is_A_TeSt';
    const result = unscream(input);
    expect(result).toBe('This Is A Test');
  });

  it('should handle input with leading and trailing underscores', () => {
    const input = '_THIS_IS_A_TEST_';
    const result = unscream(input);
    expect(result).toBe(' This Is A Test ');
  });

  it('should handle empty string input', () => {
    const input = '';
    const result = unscream(input);
    expect(result).toBe('');
  });
});
