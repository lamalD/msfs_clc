

export function storeLocalData<T>(key:string, value:T) {
    localStorage.setItem(key, JSON.stringify(value))
}

export function getLocalData<T>(key:string): T | null {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
}

export function removeLocalData(key:string) {
    localStorage.removeItem(key)
}