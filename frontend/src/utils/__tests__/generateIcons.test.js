import { generateIconSVG, generateIcons, generateFavicon, generateAppleTouchIcon } from '../generateIcons';

// Mock de btoa
global.btoa = jest.fn((str) => Buffer.from(str, 'binary').toString('base64'));

describe('generateIcons Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateIconSVG', () => {
    it('generates SVG with default text', () => {
      const result = generateIconSVG(64);
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('F'));
    });

    it('generates SVG with custom text', () => {
      const result = generateIconSVG(128, 'X');
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('X'));
    });

    it('generates SVG with correct size', () => {
      const result = generateIconSVG(256);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('width="256"'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('height="256"'));
    });

    it('includes proper SVG structure', () => {
      const result = generateIconSVG(64);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('<svg'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('<rect'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('<text'));
    });

    it('includes proper styling', () => {
      const result = generateIconSVG(64);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('fill="#1f2937"'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('fill="#FFD700"'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('font-family="Dancing Script"'));
    });
  });

  describe('generateIcons', () => {
    it('generates icons for all required sizes', () => {
      const icons = generateIcons();
      expect(icons).toHaveLength(10);
      
      const sizes = icons.map(icon => icon.size);
      expect(sizes).toEqual([16, 32, 72, 96, 128, 144, 152, 192, 384, 512]);
    });

    it('generates icons with correct properties', () => {
      const icons = generateIcons();
      const firstIcon = icons[0];
      
      expect(firstIcon).toHaveProperty('size', 16);
      expect(firstIcon).toHaveProperty('src');
      expect(firstIcon).toHaveProperty('type', 'image/svg+xml');
      expect(firstIcon.src).toMatch(/^data:image\/svg\+xml;base64,/);
    });

    it('calls generateIconSVG for each size', () => {
      const generateIconSVGSpy = jest.spyOn(require('../generateIcons'), 'generateIconSVG');
      generateIcons();
      
      expect(generateIconSVGSpy).toHaveBeenCalledTimes(10);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(16);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(32);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(72);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(96);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(128);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(144);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(152);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(192);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(384);
      expect(generateIconSVGSpy).toHaveBeenCalledWith(512);
    });
  });

  describe('generateFavicon', () => {
    it('generates favicon with correct size', () => {
      const result = generateFavicon();
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('width="32"'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('height="32"'));
    });

    it('generates favicon with default text', () => {
      const result = generateFavicon();
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('F'));
    });
  });

  describe('generateAppleTouchIcon', () => {
    it('generates apple touch icon with correct size', () => {
      const result = generateAppleTouchIcon();
      expect(result).toMatch(/^data:image\/svg\+xml;base64,/);
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('width="192"'));
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('height="192"'));
    });

    it('generates apple touch icon with default text', () => {
      const result = generateAppleTouchIcon();
      expect(global.btoa).toHaveBeenCalledWith(expect.stringContaining('F'));
    });
  });

  describe('SVG Content Validation', () => {
    it('generates valid SVG structure', () => {
      const result = generateIconSVG(64);
      const decoded = Buffer.from(result.split(',')[1], 'base64').toString();
      
      expect(decoded).toContain('<svg');
      expect(decoded).toContain('</svg>');
      expect(decoded).toContain('<rect');
      expect(decoded).toContain('<text');
    });

    it('includes proper attributes', () => {
      const result = generateIconSVG(64);
      const decoded = Buffer.from(result.split(',')[1], 'base64').toString();
      
      expect(decoded).toContain('xmlns="http://www.w3.org/2000/svg"');
      expect(decoded).toContain('width="64"');
      expect(decoded).toContain('height="64"');
    });

    it('includes proper styling attributes', () => {
      const result = generateIconSVG(64);
      const decoded = Buffer.from(result.split(',')[1], 'base64').toString();
      
      expect(decoded).toContain('fill="#1f2937"');
      expect(decoded).toContain('fill="#FFD700"');
      expect(decoded).toContain('font-family="Dancing Script, cursive"');
      expect(decoded).toContain('font-weight="bold"');
    });
  });
});
