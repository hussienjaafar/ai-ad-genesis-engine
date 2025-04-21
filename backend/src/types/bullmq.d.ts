
declare module 'bullmq' {
  export class Queue {
    constructor(name: string, options?: any);
    add(name: string, data?: any, opts?: any): Promise<any>;
    obliterate(options?: any): Promise<any>;
  }

  export class QueueScheduler {
    constructor(name: string, options?: any);
  }

  export class Worker {
    constructor(name: string, processor: (job: any) => Promise<any>, options?: any);
    on(event: string, callback: (job?: any, err?: any) => void): void;
  }
}
