const DataAdaptor = require('../../../src/data-adaptor');

describe('DataAdaptor config validation', () => {
  test('rejects when sources is missing', () => {
    const bad = [{}];
    expect(() => new DataAdaptor(bad))
      .toThrow(/"sources" must be an object/i);
  });

  test('rejects when sources is empty', () => {
    const bad = [{ sources: {} }];
    expect(() => new DataAdaptor(bad))
      .toThrow(/"sources" cannot be empty/i);
  });

  test('rejects when target is missing', () => {
    const bad = [{ sources: { name: 'name' } }];
    expect(() => new DataAdaptor(bad))
      .toThrow(/target/i);
  });

  // ✅ This is the one failing for you: assert the real error
  test('rejects when type is missing or not a non-empty string', () => {
    const bad1 = [{ sources: { name: 'name' }, target: 'userName' }];
    const bad2 = [{ sources: { name: 'name' }, target: 'userName', type: '' }];

    expect(() => new DataAdaptor(bad1))
      .toThrow(/"type" must be a non-empty string/i);

    expect(() => new DataAdaptor(bad2))
      .toThrow(/"type" must be a non-empty string/i);
  });

  // ✅ Happy path: include type so it does NOT throw
  test('accepts minimal valid rule (sources, target, type)', () => {
    const good = [{
      sources: { name: 'name' },
      target: 'userName',
      type: 'string'
    }];

    expect(() => new DataAdaptor(good)).not.toThrow();
  });
});
