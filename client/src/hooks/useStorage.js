import { useCallback, useState, useEffect } from 'react'

export function useLocalStorage(key, defaultValue) {
  return useStorage(key, defaultValue, window.localStorage)
}

export function useSessionStorage(key, defaultValue) {
  return useStorage(key, defaultValue, window.sessionStorage)
}

function useStorage(key, defaultValue, storageObject) {
  const [value, setValue] = useState(() => {
    // function either insert value from storage..
    const jsonValue = storageObject.getItem(key)
    if (jsonValue != null) return JSON.parse(jsonValue)
    // either take received defaultValue
    if (typeof defaultValue === 'function') {
      return defaultValue()
    } else {
      return defaultValue
    }
  })

  useEffect(() => {
    // this checkup needed for proper remove function behavior
    if (value === undefined) return storageObject.removeItem(key)
    // place value into storage
    storageObject.setItem(key, JSON.stringify(value))
  }, [key, value, storageObject])

  const remove = useCallback(() => {
    setValue(undefined)
  }, [])

  return [value, setValue, remove]
}
