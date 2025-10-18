/**
 * Object utility functions for type-safe operations
 */

/**
 * Check if an object is empty (has no own properties)
 */
export const isEmpty = (obj: object | null | undefined): boolean => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Check if an object is not empty
 */
export const isNotEmpty = (obj: object | null | undefined): boolean => {
  return !isEmpty(obj);
};

/**
 * Pick specific properties from an object
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

/**
 * Omit specific properties from an object
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result;
};

/**
 * Deep clone an object (simple version using JSON)
 * Note: This won't work with functions, symbols, undefined values, etc.
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if two objects are deeply equal
 */
export const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return false;
  if (typeof obj1 !== "object" || typeof obj2 !== "object") return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(
    (key) => keys2.includes(key) && isEqual(obj1[key], obj2[key]),
  );
};

/**
 * Merge two objects (shallow merge)
 */
export const merge = <T extends object, U extends object>(
  obj1: T,
  obj2: U,
): T & U => {
  return { ...obj1, ...obj2 };
};

/**
 * Get a nested property safely
 */
export const getNestedProperty = <T = any>(
  obj: any,
  path: string,
  defaultValue?: T,
): T | undefined => {
  const keys = path.split(".");
  let result = obj;

  for (const key of keys) {
    if (result == null || typeof result !== "object") {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
};

/**
 * Check if an object has a specific property
 */
export const hasProperty = <T extends object>(
  obj: T,
  key: PropertyKey,
): boolean => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};
