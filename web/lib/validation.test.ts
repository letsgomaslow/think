import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeName, nameSchema } from './validation';

describe('Validation Utilities', () => {
  describe('escapeHtml', () => {
    it('should escape all dangerous HTML characters', () => {
      expect(escapeHtml('<')).toBe('&lt;');
      expect(escapeHtml('>')).toBe('&gt;');
      expect(escapeHtml('&')).toBe('&amp;');
      expect(escapeHtml('"')).toBe('&quot;');
      expect(escapeHtml("'")).toBe('&#x27;');
    });

    it('should escape multiple dangerous characters in a string', () => {
      expect(escapeHtml('<div>"hello" & \'world\'</div>'))
        .toBe('&lt;div&gt;&quot;hello&quot; &amp; &#x27;world&#x27;&lt;/div&gt;');
    });

    it('should handle XSS script payloads', () => {
      const scriptPayload = '<script>alert(1)</script>';
      const escaped = escapeHtml(scriptPayload);
      expect(escaped).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      expect(escaped).not.toContain('<script>');
      expect(escaped).not.toContain('</script>');
    });

    it('should handle XSS with various alert patterns', () => {
      expect(escapeHtml('<script>alert("XSS")</script>'))
        .toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
      expect(escapeHtml("<script>alert('XSS')</script>"))
        .toBe('&lt;script&gt;alert(&#x27;XSS&#x27;)&lt;/script&gt;');
      expect(escapeHtml('<script>alert(`XSS`)</script>'))
        .toBe('&lt;script&gt;alert(`XSS`)&lt;/script&gt;');
    });

    it('should handle event handler XSS payloads', () => {
      expect(escapeHtml('<img src=x onerror="alert(1)">'))
        .toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
      expect(escapeHtml('<div onclick="alert(1)">'))
        .toBe('&lt;div onclick=&quot;alert(1)&quot;&gt;');
      expect(escapeHtml('<body onload="alert(1)">'))
        .toBe('&lt;body onload=&quot;alert(1)&quot;&gt;');
      expect(escapeHtml('<svg onload="alert(1)">'))
        .toBe('&lt;svg onload=&quot;alert(1)&quot;&gt;');
    });

    it('should handle various XSS attack vectors', () => {
      // Image onerror
      expect(escapeHtml('<img src=x onerror=alert(1)>'))
        .toBe('&lt;img src=x onerror=alert(1)&gt;');

      // SVG with script
      expect(escapeHtml('<svg><script>alert(1)</script></svg>'))
        .toBe('&lt;svg&gt;&lt;script&gt;alert(1)&lt;/script&gt;&lt;/svg&gt;');

      // Iframe
      expect(escapeHtml('<iframe src="javascript:alert(1)">'))
        .toBe('&lt;iframe src=&quot;javascript:alert(1)&quot;&gt;');

      // Link with javascript
      expect(escapeHtml('<a href="javascript:alert(1)">'))
        .toBe('&lt;a href=&quot;javascript:alert(1)&quot;&gt;');
    });

    it('should not modify safe text without special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
      expect(escapeHtml('John Doe')).toBe('John Doe');
      expect(escapeHtml('test@example.com')).toBe('test@example.com');
      expect(escapeHtml('123-456-7890')).toBe('123-456-7890');
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings with only safe characters', () => {
      expect(escapeHtml('abcdefghijklmnopqrstuvwxyz')).toBe('abcdefghijklmnopqrstuvwxyz');
      expect(escapeHtml('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      expect(escapeHtml('0123456789')).toBe('0123456789');
      expect(escapeHtml('!@#$%^*()')).toBe('!@#$%^*()');
    });
  });

  describe('sanitizeName', () => {
    describe('null and undefined handling', () => {
      it('should return null for null input', () => {
        expect(sanitizeName(null)).toBe(null);
      });

      it('should return null for undefined input', () => {
        expect(sanitizeName(undefined)).toBe(null);
      });

      it('should return null for empty string', () => {
        expect(sanitizeName('')).toBe(null);
      });
    });

    describe('whitespace handling', () => {
      it('should return null for whitespace-only strings', () => {
        expect(sanitizeName(' ')).toBe(null);
        expect(sanitizeName('  ')).toBe(null);
        expect(sanitizeName('   ')).toBe(null);
        expect(sanitizeName('\t')).toBe(null);
        expect(sanitizeName('\n')).toBe(null);
        expect(sanitizeName('\r\n')).toBe(null);
        expect(sanitizeName('  \t  \n  ')).toBe(null);
      });

      it('should trim leading and trailing whitespace', () => {
        expect(sanitizeName(' John ')).toBe('John');
        expect(sanitizeName('  Jane  ')).toBe('Jane');
        expect(sanitizeName('\tBob\t')).toBe('Bob');
        expect(sanitizeName('\nAlice\n')).toBe('Alice');
        expect(sanitizeName('  Sarah Smith  ')).toBe('Sarah Smith');
      });

      it('should preserve internal whitespace', () => {
        expect(sanitizeName('John Doe')).toBe('John Doe');
        expect(sanitizeName('Mary Jane Watson')).toBe('Mary Jane Watson');
        expect(sanitizeName('Name  With  Multiple  Spaces')).toBe('Name  With  Multiple  Spaces');
      });
    });

    describe('length validation', () => {
      it('should accept 1 character names', () => {
        expect(sanitizeName('A')).toBe('A');
        expect(sanitizeName('Z')).toBe('Z');
        expect(sanitizeName('1')).toBe('1');
      });

      it('should accept names at exactly 100 characters', () => {
        const name100 = 'a'.repeat(100);
        expect(sanitizeName(name100)).toBe(name100);
        expect(sanitizeName(name100)?.length).toBe(100);
      });

      it('should reject names over 100 characters', () => {
        const name101 = 'a'.repeat(101);
        expect(sanitizeName(name101)).toBe(null);

        const name200 = 'a'.repeat(200);
        expect(sanitizeName(name200)).toBe(null);
      });

      it('should validate length after trimming', () => {
        // 98 chars + 2 spaces = 100 total, but 98 after trim (should pass)
        const name = ' ' + 'a'.repeat(98) + ' ';
        expect(sanitizeName(name)).toBe('a'.repeat(98));

        // 101 chars + 2 spaces = 103 total, but 101 after trim (should fail)
        const longName = ' ' + 'a'.repeat(101) + ' ';
        expect(sanitizeName(longName)).toBe(null);
      });
    });

    describe('XSS protection', () => {
      it('should escape HTML characters in valid names', () => {
        expect(sanitizeName('John<script>')).toBe('John&lt;script&gt;');
        expect(sanitizeName('Jane & Bob')).toBe('Jane &amp; Bob');
        expect(sanitizeName('Name with "quotes"')).toBe('Name with &quot;quotes&quot;');
        expect(sanitizeName("O'Brien")).toBe('O&#x27;Brien');
      });

      it('should escape XSS script payloads', () => {
        expect(sanitizeName('<script>alert(1)</script>'))
          .toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
      });

      it('should escape event handler attacks', () => {
        expect(sanitizeName('<img src=x onerror="alert(1)">'))
          .toBe('&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
        expect(sanitizeName('"><script>alert(1)</script>'))
          .toBe('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
      });

      it('should escape HTML injection attempts', () => {
        expect(sanitizeName('<div>Malicious</div>'))
          .toBe('&lt;div&gt;Malicious&lt;/div&gt;');
        expect(sanitizeName('<iframe src="evil.com">'))
          .toBe('&lt;iframe src=&quot;evil.com&quot;&gt;');
      });
    });

    describe('unicode and international characters', () => {
      it('should handle unicode characters', () => {
        expect(sanitizeName('José')).toBe('José');
        expect(sanitizeName('Müller')).toBe('Müller');
        expect(sanitizeName('Björk')).toBe('Björk');
        expect(sanitizeName('François')).toBe('François');
      });

      it('should handle various international names', () => {
        expect(sanitizeName('Владимир')).toBe('Владимир'); // Russian
        expect(sanitizeName('田中')).toBe('田中'); // Japanese
        expect(sanitizeName('김민준')).toBe('김민준'); // Korean
        expect(sanitizeName('محمد')).toBe('محمد'); // Arabic
        expect(sanitizeName('Αλέξανδρος')).toBe('Αλέξανδρος'); // Greek
      });

      it('should handle emoji in names', () => {
        expect(sanitizeName('John 😊')).toBe('John 😊');
        expect(sanitizeName('💯 Sarah')).toBe('💯 Sarah');
      });

      it('should handle mixed unicode and ASCII', () => {
        expect(sanitizeName('José García')).toBe('José García');
        expect(sanitizeName('André-Pierre')).toBe('André-Pierre');
        expect(sanitizeName('Søren Kierkegaard')).toBe('Søren Kierkegaard');
      });

      it('should respect 100 char limit with unicode', () => {
        // Unicode characters may take multiple bytes, but we count characters
        const unicode50 = '田'.repeat(100);
        expect(sanitizeName(unicode50)).toBe(unicode50);

        const unicode101 = '田'.repeat(101);
        expect(sanitizeName(unicode101)).toBe(null);
      });
    });

    describe('normal valid names', () => {
      it('should handle common English names', () => {
        expect(sanitizeName('John')).toBe('John');
        expect(sanitizeName('Jane Smith')).toBe('Jane Smith');
        expect(sanitizeName('Robert Johnson')).toBe('Robert Johnson');
        expect(sanitizeName('Mary-Ann O\'Connor')).toBe('Mary-Ann O&#x27;Connor');
      });

      it('should handle names with hyphens and apostrophes', () => {
        expect(sanitizeName('Jean-Pierre')).toBe('Jean-Pierre');
        expect(sanitizeName('Mary-Kate')).toBe('Mary-Kate');
        expect(sanitizeName("O'Brien")).toBe('O&#x27;Brien');
        expect(sanitizeName("D'Angelo")).toBe('D&#x27;Angelo');
      });

      it('should handle names with numbers', () => {
        expect(sanitizeName('John Smith Jr.')).toBe('John Smith Jr.');
        expect(sanitizeName('Louis XIV')).toBe('Louis XIV');
        expect(sanitizeName('Elizabeth II')).toBe('Elizabeth II');
      });

      it('should handle single word names', () => {
        expect(sanitizeName('Madonna')).toBe('Madonna');
        expect(sanitizeName('Prince')).toBe('Prince');
        expect(sanitizeName('Cher')).toBe('Cher');
      });

      it('should handle full names with multiple parts', () => {
        expect(sanitizeName('John Paul Jones')).toBe('John Paul Jones');
        expect(sanitizeName('Mary Jane Watson Parker')).toBe('Mary Jane Watson Parker');
      });
    });

    describe('edge cases', () => {
      it('should handle special but safe characters', () => {
        expect(sanitizeName('Name-With-Hyphens')).toBe('Name-With-Hyphens');
        expect(sanitizeName('Name.With.Dots')).toBe('Name.With.Dots');
        expect(sanitizeName('Name_With_Underscores')).toBe('Name_With_Underscores');
        expect(sanitizeName('Name (Nickname)')).toBe('Name (Nickname)');
        expect(sanitizeName('Name, Jr.')).toBe('Name, Jr.');
      });

      it('should handle names that become empty after trimming', () => {
        expect(sanitizeName('   ')).toBe(null);
        expect(sanitizeName('\t\n\r')).toBe(null);
      });

      it('should handle names at boundary with special characters', () => {
        // 98 regular chars + 2 chars that will be escaped (< becomes &lt;)
        const name = 'a'.repeat(98) + '<>';
        const result = sanitizeName(name);
        expect(result).not.toBe(null);
        expect(result).toContain('&lt;&gt;');
      });

      it('should handle mixed case names', () => {
        expect(sanitizeName('JoHn DoE')).toBe('JoHn DoE');
        expect(sanitizeName('UPPERCASE NAME')).toBe('UPPERCASE NAME');
        expect(sanitizeName('lowercase name')).toBe('lowercase name');
      });
    });
  });

  describe('nameSchema (Zod validation)', () => {
    describe('valid names', () => {
      it('should validate normal names', () => {
        expect(nameSchema.safeParse('John Doe').success).toBe(true);
        expect(nameSchema.safeParse('Jane Smith').success).toBe(true);
        expect(nameSchema.safeParse('Bob').success).toBe(true);
      });

      it('should validate names with special characters', () => {
        expect(nameSchema.safeParse("O'Brien").success).toBe(true);
        expect(nameSchema.safeParse('Jean-Pierre').success).toBe(true);
        expect(nameSchema.safeParse('Name (Nickname)').success).toBe(true);
      });

      it('should validate unicode names', () => {
        expect(nameSchema.safeParse('José García').success).toBe(true);
        expect(nameSchema.safeParse('田中').success).toBe(true);
        expect(nameSchema.safeParse('Владимир').success).toBe(true);
      });

      it('should automatically trim valid names', () => {
        const result = nameSchema.safeParse('  John  ');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('John');
        }
      });

      it('should validate names at exactly 100 characters', () => {
        const name100 = 'a'.repeat(100);
        expect(nameSchema.safeParse(name100).success).toBe(true);
      });

      it('should validate single character names', () => {
        expect(nameSchema.safeParse('A').success).toBe(true);
        expect(nameSchema.safeParse('Z').success).toBe(true);
      });
    });

    describe('invalid names', () => {
      it('should reject empty strings', () => {
        const result = nameSchema.safeParse('');
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Name must not be empty');
        }
      });

      it('should reject whitespace-only strings', () => {
        expect(nameSchema.safeParse(' ').success).toBe(false);
        expect(nameSchema.safeParse('  ').success).toBe(false);
        expect(nameSchema.safeParse('\t').success).toBe(false);
        expect(nameSchema.safeParse('\n').success).toBe(false);
      });

      it('should reject names over 100 characters', () => {
        const name101 = 'a'.repeat(101);
        const result = nameSchema.safeParse(name101);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.errors[0].message).toBe('Name must be 100 characters or less');
        }
      });

      it('should reject names much longer than limit', () => {
        expect(nameSchema.safeParse('a'.repeat(200)).success).toBe(false);
        expect(nameSchema.safeParse('a'.repeat(1000)).success).toBe(false);
      });

      it('should reject non-string values', () => {
        expect(nameSchema.safeParse(123 as any).success).toBe(false);
        expect(nameSchema.safeParse(null as any).success).toBe(false);
        expect(nameSchema.safeParse(undefined as any).success).toBe(false);
        expect(nameSchema.safeParse({} as any).success).toBe(false);
        expect(nameSchema.safeParse([] as any).success).toBe(false);
      });
    });

    describe('trimming behavior', () => {
      it('should trim leading whitespace', () => {
        const result = nameSchema.safeParse('  John');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('John');
        }
      });

      it('should trim trailing whitespace', () => {
        const result = nameSchema.safeParse('Jane  ');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('Jane');
        }
      });

      it('should trim both leading and trailing whitespace', () => {
        const result = nameSchema.safeParse('  Bob  ');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('Bob');
        }
      });

      it('should preserve internal whitespace', () => {
        const result = nameSchema.safeParse('  John  Doe  ');
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe('John  Doe');
        }
      });

      it('should validate length after trimming', () => {
        // 98 chars + 2 spaces = 100 total, but 98 after trim (should pass)
        const name = ' ' + 'a'.repeat(98) + ' ';
        expect(nameSchema.safeParse(name).success).toBe(true);

        // 101 chars + 2 spaces = 103 total, but 101 after trim (should fail)
        const longName = ' ' + 'a'.repeat(101) + ' ';
        expect(nameSchema.safeParse(longName).success).toBe(false);
      });
    });

    describe('integration with sanitizeName', () => {
      it('should work together for valid names', () => {
        const input = ' John Doe ';
        const validated = nameSchema.safeParse(input);
        expect(validated.success).toBe(true);

        if (validated.success) {
          const sanitized = sanitizeName(validated.data);
          expect(sanitized).toBe('John Doe');
        }
      });

      it('should handle names that need HTML escaping', () => {
        const input = "O'Brien";
        const validated = nameSchema.safeParse(input);
        expect(validated.success).toBe(true);

        if (validated.success) {
          const sanitized = sanitizeName(validated.data);
          expect(sanitized).toBe('O&#x27;Brien');
        }
      });

      it('should reject names that are too long', () => {
        const input = 'a'.repeat(101);
        const validated = nameSchema.safeParse(input);
        expect(validated.success).toBe(false);

        const sanitized = sanitizeName(input);
        expect(sanitized).toBe(null);
      });
    });
  });
});
