/** https://github.com/jsdoc2md/jsdoc-api */
declare module 'jsdoc-api' {
    import CachePoint from 'cache-point';
  
    interface JsdocOptions {
      files?: string | string[];
      source?: string;
      cache?: boolean;
      access?: 'public' | 'protected' | 'private' | 'undefined' | 'all';
      configure?: string;
      destination?: string;
      encoding?: string;
      private?: boolean;
      package?: string;
      pedantic?: boolean;
      query?: string;
      recurse?: boolean;
      readme?: string;
      template?: string;
      tutorials?: string;
    }
  
    const cache: CachePoint;
  
    function explainSync(options?: JsdocOptions): object[];
    function explain(options?: JsdocOptions): Promise<object[]>;
    function renderSync(options?: JsdocOptions): void;
  
    export {
      cache,
      explainSync,
      explain,
      renderSync
    };
  }
  