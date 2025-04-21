
declare module 'simple-statistics' {
  export function chiSquaredGoodnessOfFit(observed: number[], expected: number[]): { chiSquared: number, degreesOfFreedom: number, probability: number };
  export function probit(p: number): number;
  export function chiSquaredDistributionTable(chiSquared: number, degreesOfFreedom: number): number;
}
