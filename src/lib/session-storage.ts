/**
 * Utility functions for working with session storage
 */

/**
 * Save data to session storage
 * @param key The key to store the data under
 * @param data The data to store
 */
export function saveToSessionStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data)
    sessionStorage.setItem(key, serializedData)
  } catch (error) {
    console.error(`Error saving to session storage (${key}):`, error)
  }
}

/**
 * Get data from session storage
 * @param key The key to retrieve data from
 * @returns The data if found, null otherwise
 */
export function getFromSessionStorage<T>(key: string): T | null {
  try {
    const serializedData = sessionStorage.getItem(key)
    if (!serializedData) return null
    return JSON.parse(serializedData) as T
  } catch (error) {
    console.error(`Error retrieving from session storage (${key}):`, error)
    return null
  }
}

/**
 * Remove data from session storage
 * @param key The key to remove
 */
export function removeFromSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from session storage (${key}):`, error)
  }
}

/**
 * Check if a key exists in session storage
 * @param key The key to check
 * @returns True if the key exists, false otherwise
 */
export function existsInSessionStorage(key: string): boolean {
  try {
    return sessionStorage.getItem(key) !== null
  } catch (error) {
    console.error(`Error checking session storage (${key}):`, error)
    return false
  }
}
