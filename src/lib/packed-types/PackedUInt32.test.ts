import { Provable, UInt32 } from 'o1js';
import { PackedUInt32 } from './PackedUInt32';

describe('PackedUInt32', () => {
  describe('Outside of the circuit', () => {
    const bigints = [10n, 2n ** 32n - 1n, 0n, 10n, 2n ** 32n - 100n, 42n, 0n];
    const uints = bigints.map((x) => UInt32.from(x));

    it('#fromBigInts', () => {
      const myPackedUInt32 = PackedUInt32.fromBigInts(bigints);
      expect(myPackedUInt32.toBigInts()).toMatchObject(bigints);
    });

    it('#pack and #unPack', () => {
      const packed = PackedUInt32.pack(uints);
      const unpacked = PackedUInt32.unpack(packed);

      expect(unpacked.length).toBe(uints.length);
      expect(unpacked).toMatchObject(uints);
    });
  });
  describe('Provable Properties', () => {
    it('#sizeInFields', () => {
      expect(PackedUInt32.sizeInFields()).toBe(1);
    });
  });
  describe('Defensive Cases', () => {
    it('throws for input >= 8 uints', () => {
      expect(() => PackedUInt32).not.toThrow();
      expect(() => PackedUInt32).toThrow();
    });

    it('initalizes with more input than allowed', () => {
      const bigints = [
        10n,
        2n ** 32n - 1n,
        0n,
        10n,
        2n ** 32n - 100n,
        42n,
        0n,
        0n,
      ];

      expect(() => {
        PackedUInt32.fromBigInts(bigints);
      }).toThrow();
    });

    it('initalizes with less input than specified', () => {
      const bigints = [10n];

      const expected = [10n, 0n, 0n, 0n, 0n, 0n, 0n];

      expect(PackedUInt32.fromBigInts(bigints).toBigInts()).toMatchObject(
        expected
      );
    });
  });
  describe('In the circuit', () => {
    const bigints = [10n, 2n ** 32n - 1n, 0n, 10n, 2n ** 32n - 100n, 42n, 0n];
    const outsidePackedUInt = PackedUInt32.fromBigInts(bigints);

    it('Initializes', () => {
      expect(() => {
        Provable.runAndCheck(() => {
          const packedUInt32 = new PackedUInt32(outsidePackedUInt.packed);

          PackedUInt32.check({ packed: packedUInt32.packed });
        });
      }).not.toThrow();
    });
    it('#assertEquals', () => {
      expect(() => {
        Provable.runAndCheck(() => {
          const packedUInt32 = new PackedUInt32(outsidePackedUInt.packed);
          packedUInt32.assertEquals(outsidePackedUInt);
        });
      }).not.toThrow();
      expect(() => {
        Provable.runAndCheck(() => {
          const fakePacked = outsidePackedUInt.packed.add(32);
          const packedUInt32 = new PackedUInt32(fakePacked);
          packedUInt32.assertEquals(outsidePackedUInt);
        });
      }).toThrow();
    });
  });
});
