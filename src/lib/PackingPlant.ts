import {
  Field,
  Struct,
  Poseidon,
  provable,
  InferProvable,
  Provable,
} from 'o1js';

const MAX_BITS_PER_FIELD = 254n;

export function PackingPlant<A, T extends InferProvable<A> = InferProvable<A>>(
  elementType: A,
  l: number,
  bitSize: bigint
) {
  if (bitSize * BigInt(l) > MAX_BITS_PER_FIELD) {
    throw new Error(
      `The Packing Plant is only accepting orders that can fit into one Field, try using MultiPackingPlant`
    );
  }
  abstract class Packed_ extends Struct({
    packed: Field,
  }) {
    static type = provable({ packed: Field }, {});
    static l: number = l;
    packed: Field;
    bitSize: bigint = bitSize;

    constructor(packed: Field) {
      super({ packed });
    }

    static pack(unpacked: Array<T>): Field {
      throw new Error('Must implement pack');
      let f = Field(0);
      return f;
    }

    static unpack(f: Field) {
      const unpacked = this.toAuxiliary({ packed: f });
      f.assertEquals(this.pack(unpacked));
      return unpacked;
    }

    assertEquals(other: Packed_) {
      this.packed.assertEquals(other.packed);
    }
  }
  return Packed_;
}

export function MultiPackingPlant<
  A,
  T extends InferProvable<A> = InferProvable<A>
>(elementType: A, l: number, bitSize: bigint) {
  if (bitSize * BigInt(l) > 8n * MAX_BITS_PER_FIELD) {
    throw new Error(
      `The Packing Plant is only accepting orders that can fit into eight Fields`
    );
  }
  const n = Math.ceil(Number(bitSize * BigInt(l)) / Number(255n));
  abstract class Packed_ extends Struct({
    packed: Provable.Array(Field, n),
  }) {
    static type = provable({ packed: Provable.Array(Field, n) }, {});
    static l: number = l;
    static n: number = n;
    packed: Array<Field>;
    aux: Array<T>;
    bitSize: bigint = bitSize;

    constructor(packed: Array<Field>, aux: Array<T>) {
      if (aux.length > l) {
        throw new Error('Length of aux data is too long');
      }
      super({ packed });
      this.aux = aux;
    }

    static pack(aux: Array<T>): Array<Field> {
      throw new Error('Must implement pack');
      let f = [Field(0)];
      return f;
    }

    static unpack(fields: Array<Field>): Array<T> {
      throw new Error('Must implement pack');
    }

    assertEquals(other: Packed_) {
      Poseidon.hash(this.packed).assertEquals(Poseidon.hash(other.packed));
    }
  }
  return Packed_;
}
