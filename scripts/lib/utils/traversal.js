/**
 * Deep object traversal utilities for OpenAPI spec modification
 */

/**
 * Recursively traverse an object and apply a visitor function to each node
 * @param {object} obj - The object to traverse
 * @param {function} visitor - Function called for each node: visitor(obj, path)
 * @param {array} path - Current path in the object tree
 * @param {WeakSet} visited - Set to track visited objects (prevents circular references)
 */
function traverseObject(obj, visitor, path = [], visited = new WeakSet()) {
  // Base cases: skip non-objects, null, and already-visited objects
  if (typeof obj !== 'object' || obj === null) return;
  if (visited.has(obj)) return;

  // Mark as visited to prevent circular reference loops
  visited.add(obj);

  // Apply visitor to current object
  visitor(obj, path);

  // Recursively traverse children
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      traverseObject(item, visitor, [...path, index], visited);
    });
  } else {
    Object.keys(obj).forEach(key => {
      traverseObject(obj[key], visitor, [...path, key], visited);
    });
  }
}

/**
 * Get value at a specific path in an object
 * @param {object} obj - The object to query
 * @param {array} path - Path array (e.g., ['paths', '/users', 'get'])
 * @returns {*} Value at path, or undefined if not found
 */
function getAtPath(obj, path) {
  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  return current;
}

/**
 * Set value at a specific path in an object
 * @param {object} obj - The object to modify
 * @param {array} path - Path array
 * @param {*} value - Value to set
 */
function setAtPath(obj, path, value) {
  if (path.length === 0) return;

  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  current[path[path.length - 1]] = value;
}

module.exports = {
  traverseObject,
  getAtPath,
  setAtPath
};
