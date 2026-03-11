/**
 * Parse collection name into module and sub-name
 * e.g. "24diet_full_menu" → { module: "24diet", sub: "full_menu", display: "Full Menu" }
 */
export function parseModuleCollection(name) {
  if (!name || !name.includes('_')) return null;
  const parts = name.split('_');
  const module = parts[0];
  const sub = parts.slice(1).join('_');
  const display = toTitleCase(sub.replace(/_/g, ' '));
  return { module, sub, display, fullName: name };
}

/**
 * Group collections by module prefix (e.g. 24diet, fitness)
 */
export function groupByModule(collections) {
  const modules = {};
  for (const col of collections) {
    const parsed = parseModuleCollection(col);
    if (parsed) {
      if (!modules[parsed.module]) {
        modules[parsed.module] = [];
      }
      modules[parsed.module].push(parsed);
    }
  }
  return modules;
}

/**
 * Check if collection has module prefix (module_subname)
 */
export function isModuleCollection(name) {
  return name && name.includes('_') && /^[a-z0-9]+_/i.test(name);
}

const DISPLAY_NAME_OVERRIDES = {
  '24diet_products': 'Product Catalog',
};

/**
 * Convert Firestore collection name to user-friendly display name
 */
export function getCollectionDisplayName(collectionName) {
  if (!collectionName) return '';
  if (DISPLAY_NAME_OVERRIDES[collectionName]) return DISPLAY_NAME_OVERRIDES[collectionName];
  const parsed = parseModuleCollection(collectionName);
  if (parsed) return parsed.display;
  return toTitleCase(collectionName.replace(/_/g, ' '));
}

function toTitleCase(str) {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
