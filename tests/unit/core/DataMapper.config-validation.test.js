const DataMapper = require('../../../src/data-mapper');

describe('DataMapper – config validation', () => {
  // --- Top-level container validation ---
  it('throws when mapping config is not an array', () => {
    expect(() => new DataMapper(null)).toThrow(/mapping config must be an array/i);
    expect(() => new DataMapper({})).toThrow(/mapping config must be an array/i);
  });

  // --- Rule-level: sources ---
  it('throws when "sources" is missing', () => {
    const bad = [{}];
    expect(() => new DataMapper(bad)).toThrow(/"sources" must be an object/i);
  });

  it('throws when "sources" is not an object (e.g., array)', () => {
    const bad = [{ sources: ['name'], target: 'userName', type: 'string' }];
    expect(() => new DataMapper(bad)).toThrow(/"sources" must be an object/i);
  });

  it('throws when "sources" is an empty object', () => {
    const bad = [{ sources: {}, target: 'userName', type: 'string' }];
    expect(() => new DataMapper(bad)).toThrow(/"sources" cannot be empty/i);
  });

  // --- Rule-level: target ---
  it('throws when "target" is missing', () => {
    const bad = [{ sources: { name: 'name' }, type: 'string' }];
    expect(() => new DataMapper(bad)).toThrow(/target/i);
  });

  it('throws when "target" is not a non-empty string', () => {
    const bad1 = [{ sources: { name: 'name' }, target: '', type: 'string' }];
    const bad2 = [{ sources: { name: 'name' }, target: 123, type: 'string' }];
    expect(() => new DataMapper(bad1)).toThrow(/target/i);
    expect(() => new DataMapper(bad2)).toThrow(/target/i);
  });

  // --- Rule-level: type ---
  it('throws when "type" is missing', () => {
    const bad = [{ sources: { name: 'name' }, target: 'userName' }];
    expect(() => new DataMapper(bad)).toThrow(/"type" must be a non-empty string/i);
  });

  it('throws when "type" is not a non-empty string', () => {
    const bad1 = [{ sources: { name: 'name' }, target: 'userName', type: '' }];
    const bad2 = [{ sources: { name: 'name' }, target: 'userName', type: 42 }];
    expect(() => new DataMapper(bad1)).toThrow(/"type" must be a non-empty string/i);
    expect(() => new DataMapper(bad2)).toThrow(/"type" must be a non-empty string/i);
  });

  // --- Optional: transform ---
  it('throws when "transform" is provided but not a function', () => {
    const bad = [{
      sources: { name: 'name' },
      target: 'userName',
      type: 'string',
      transform: 'not-a-function'
    }];
    expect(() => new DataMapper(bad)).toThrow(/transform/i);
  });

  // --- Happy path ---
  it('accepts minimal valid rule (sources, target, type)', () => {
    const good = [{
      sources: { name: 'name' },
      target: 'userName',
      type: 'string'
    }];
    expect(() => new DataMapper(good)).not.toThrow();
  });
});
