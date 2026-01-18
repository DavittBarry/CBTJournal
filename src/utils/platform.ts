export const getPlatform = (): 'ios' | 'android' | 'web' => {
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios'
  }
  
  if (/android/.test(userAgent)) {
    return 'android'
  }
  
  return 'web'
}

export const isNativeMobile = (): boolean => {
  return getPlatform() !== 'web'
}

export const supportsFileSystemAccess = (): boolean => {
  return 'showSaveFilePicker' in window && getPlatform() === 'web'
}

export const isMobileDevice = (): boolean => {
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase())
}
