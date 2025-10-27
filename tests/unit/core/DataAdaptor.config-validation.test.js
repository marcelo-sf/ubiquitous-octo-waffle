const DataAdaptor = require('../../../src/data-adaptor');

describe('DataAdaptor – config validation', () => {
  // --- Top-level container validation ---
  it('throws when mapping config is not an array', () => {
    expect(() => new DataAdaptor(null)).toThrow(/mapping config must be an array/i);
    expect(() => new DataAdaptor({})).toThrow(/mapping config must be an array/i);
  });

  // --- Rule-level: sources ---
  it('throws when "sources" is missing', () => {
    const bad = [{}];
    expect(() => new DataAdaptor(bad)).toThrow(/"sources" must be an object/i);
  });

  it('throws when "sources" is not an object (e.g., array)', () => {
    const bad = [{ sources: ['name'], target: 'userName', type: 'string' }];
    expect(() => new DataAdaptor(bad)).toThrow(/"sources" must be an object/i);
  });

  it('throws when "sources" is an empty object', () => {
    const bad = [{ sources: {}, target: 'userName', type: 'string' }];
    expect(() => new DataAdaptor(bad)).toThrow(/"sources" cannot be empty/i);
  });

  // --- Rule-level: target ---
  it('throws when "target" is missing', () => {
    const bad = [{ sources: { name: 'name' }, type: 'string' }];
    expect(() => new DataAdaptor(bad)).toThrow(/target/i);
  });

  it('throws when "target" is not a non-empty string', () => {
    const bad1 = [{ sources: { name: 'name' }, target: '', type: 'string' }];
    const bad2 = [{ sources: { name: 'name' }, target: 123, type: 'string' }];
    expect(() => new DataAdaptor(bad1)).toThrow(/target/i);
    expect(() => new DataAdaptor(bad2)).toThrow(/target/i);
  });

  // --- Rule-level: type ---
  it('throws when "type" is missing', () => {
    const bad = [{ sources: { name: 'name' }, target: 'userName' }];
    expect(() => new DataAdaptor(bad)).toThrow(/"type" must be a non-empty string/i);
  });

  it('throws when "type" is not a non-empty string', () => {
    const bad1 = [{ sources: { name: 'name' }, target: 'userName', type: '' }];
    const bad2 = [{ sources: { name: 'name' }, target: 'userName', type: 42 }];
    expect(() => new DataAdaptor(bad1)).toThrow(/"type" must be a non-empty string/i);
    expect(() => new DataAdaptor(bad2)).toThrow(/"type" must be a non-empty string/i);
  });

  // --- Optional: transform ---
  it('throws when "transform" is provided but not a function', () => {
    const bad = [{
      sources: { name: 'name' },
      target: 'userName',
      type: 'string',
      transform: 'not-a-function'
    }];
    expect(() => new DataAdaptor(bad)).toThrow(/transform/i);
  });

  // --- Happy path ---
  it('accepts minimal valid rule (sources, target, type)', () => {
    const good = [{
      sources: { name: 'name' },
      target: 'userName',
      type: 'string'
    }];
    expect(() => new DataAdaptor(good)).not.toThrow();
  });
});
