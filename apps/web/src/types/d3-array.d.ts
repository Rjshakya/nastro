declare module "d3-array" {
  export function bisector<T, U>(
    accessor: (d: T) => U,
  ): {
    center(array: T[], x: U): number;
    left(array: T[], x: U, lo?: number, hi?: number): number;
    right(array: T[], x: U, lo?: number, hi?: number): number;
  };

  export function extent<T>(
    iterable: Iterable<T>,
    accessor: (d: T) => number | undefined,
  ): [number, number] | [undefined, undefined];
}
