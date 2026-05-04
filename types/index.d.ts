export type Options = {
    /**
     * Array of variable names to ignore, e.g. `['$my-var', '$my-second-var']`. Defaults to `[]`.
     */
    ignore?: string[] | undefined;
    /**
     * Array of file globs to ignore, e.g. `['./file.scss', '**\/_variables.scss']`. Defaults to `[]`.
     */
    ignoreFiles?: string[] | undefined;
    /**
     * File extensions to search. Defaults to `['scss']`.
     */
    fileExtensions?: string | string[] | undefined;
};
export type Variable = {
    name: string;
    file: string;
    line: number;
};
export type Result = {
    /**
     * The array of unused variables.
     */
    unused: readonly Variable[];
    /**
     * The sum of all variables in the files (unused and used ones).
     */
    total: number;
};
/**
 * Returns a `Result` object with `unused` (array of unused variables) and `total` (all variables found).
 * @param {string} dirPath
 * @param {Options} [opts]
 * @returns {Result}
 */
declare function findSync(dirPath: string, opts?: Options): Result;
/**
 * Returns a Promise which resolves to a `Result`; equivalent to `find(dir, options)`.
 * @param {string} dirPath
 * @param {Options} [opts]
 * @returns {Promise<Result>}
 */
export function findAsync(dirPath: string, opts?: Options): Promise<Result>;
export { findSync as find };
