/**
 * JSON Patch utilities (RFC 6902)
 * Applies JSON Patch operations to update state in real-time
 */

interface PatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: any;
  from?: string;
}

/**
 * Apply JSON Patch operations to an object
 * @param obj - Object to patch
 * @param patches - Array of JSON Patch operations
 * @returns New patched object
 */
export function applyJsonPatch<T>(obj: T, patches: PatchOperation[]): T {
  // Deep clone to avoid mutation
  let result = JSON.parse(JSON.stringify(obj));

  for (const patch of patches) {
    result = applyOperation(result, patch);
  }

  return result;
}

function applyOperation(obj: any, op: PatchOperation): any {
  const pathParts = op.path.split('/').filter(Boolean);

  switch (op.op) {
    case 'replace':
    case 'add':
      return setValueAtPath(obj, pathParts, op.value);
    
    case 'remove':
      return removeValueAtPath(obj, pathParts);
    
    default:
      console.warn(`Unsupported JSON Patch operation: ${op.op}`);
      return obj;
  }
}

function setValueAtPath(obj: any, path: string[], value: any): any {
  if (path.length === 0) return value;

  const [head, ...tail] = path;
  const isArray = Array.isArray(obj);

  if (tail.length === 0) {
    // Last segment - set the value
    if (isArray) {
      const newArray = [...obj];
      const index = head === '-' ? newArray.length : parseInt(head);
      newArray[index] = value;
      return newArray;
    } else {
      return { ...obj, [head]: value };
    }
  } else {
    // Recurse deeper
    if (isArray) {
      const newArray = [...obj];
      const index = parseInt(head);
      newArray[index] = setValueAtPath(obj[index] || {}, tail, value);
      return newArray;
    } else {
      return {
        ...obj,
        [head]: setValueAtPath(obj[head] || {}, tail, value),
      };
    }
  }
}

function removeValueAtPath(obj: any, path: string[]): any {
  if (path.length === 0) return undefined;

  const [head, ...tail] = path;
  const isArray = Array.isArray(obj);

  if (tail.length === 0) {
    // Last segment - remove the value
    if (isArray) {
      const newArray = [...obj];
      newArray.splice(parseInt(head), 1);
      return newArray;
    } else {
      const { [head]: _, ...rest } = obj;
      return rest;
    }
  } else {
    // Recurse deeper
    if (isArray) {
      const newArray = [...obj];
      const index = parseInt(head);
      newArray[index] = removeValueAtPath(obj[index], tail);
      return newArray;
    } else {
      return {
        ...obj,
        [head]: removeValueAtPath(obj[head], tail),
      };
    }
  }
}

/**
 * Extract changed keys from JSON Patch operations
 * @param patches - Array of JSON Patch operations
 * @returns Array of top-level keys that changed
 */
export function getChangedKeysFromPatch(patches: PatchOperation[]): string[] {
  const keys = new Set<string>();

  for (const patch of patches) {
    const pathParts = patch.path.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      // Get the top-level key (e.g., "/recipe/ingredients" → "recipe")
      // But for our case, we want the second level (e.g., "/recipe/ingredients" → "ingredients")
      if (pathParts[0] === 'recipe' && pathParts.length > 1) {
        keys.add(pathParts[1]);
      } else {
        keys.add(pathParts[0]);
      }
    }
  }

  return Array.from(keys);
}