// State Manager for Ad Wizard
// Saves and loads wizard state to avoid re-running expensive operations

const STATE_KEY = 'ad_wizard_state'
const STATE_EXPIRY_HOURS = 24 // State expires after 24 hours

export const saveWizardState = (state, currentStep) => {
  try {
    const stateToSave = {
      ...state,
      currentStep,
      timestamp: new Date().getTime(),
      version: '1.0' // Version for future compatibility
    }
    
    localStorage.setItem(STATE_KEY, JSON.stringify(stateToSave))
    console.log('Wizard state saved successfully', { step: currentStep })
    return true
  } catch (error) {
    console.error('Failed to save wizard state:', error)
    return false
  }
}

export const loadWizardState = () => {
  try {
    const savedState = localStorage.getItem(STATE_KEY)
    if (!savedState) return null
    
    const state = JSON.parse(savedState)
    
    // Check if state has expired
    const expiryTime = STATE_EXPIRY_HOURS * 60 * 60 * 1000
    const isExpired = new Date().getTime() - state.timestamp > expiryTime
    
    if (isExpired) {
      clearWizardState()
      return null
    }
    
    return state
  } catch (error) {
    console.error('Failed to load wizard state:', error)
    return null
  }
}

export const clearWizardState = () => {
  try {
    localStorage.removeItem(STATE_KEY)
    console.log('Wizard state cleared')
    return true
  } catch (error) {
    console.error('Failed to clear wizard state:', error)
    return false
  }
}

// Save specific expensive data separately for longer retention
const EXPENSIVE_DATA_KEY = 'ad_wizard_expensive_data'
const EXPENSIVE_DATA_EXPIRY_DAYS = 7 // Keep expensive data for a week

export const saveExpensiveData = (key, data) => {
  try {
    const existingData = localStorage.getItem(EXPENSIVE_DATA_KEY)
    const dataStore = existingData ? JSON.parse(existingData) : {}
    
    dataStore[key] = {
      data,
      timestamp: new Date().getTime(),
      productName: data.productName || 'unknown'
    }
    
    localStorage.setItem(EXPENSIVE_DATA_KEY, JSON.stringify(dataStore))
    console.log(`Expensive data saved: ${key}`)
    return true
  } catch (error) {
    console.error('Failed to save expensive data:', error)
    return false
  }
}

export const loadExpensiveData = (key, productName) => {
  try {
    const savedData = localStorage.getItem(EXPENSIVE_DATA_KEY)
    if (!savedData) return null
    
    const dataStore = JSON.parse(savedData)
    const item = dataStore[key]
    
    if (!item) return null
    
    // Check if data matches current product
    if (productName && item.productName !== productName) return null
    
    // Check if data has expired
    const expiryTime = EXPENSIVE_DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    const isExpired = new Date().getTime() - item.timestamp > expiryTime
    
    if (isExpired) {
      delete dataStore[key]
      localStorage.setItem(EXPENSIVE_DATA_KEY, JSON.stringify(dataStore))
      return null
    }
    
    return item.data
  } catch (error) {
    console.error('Failed to load expensive data:', error)
    return null
  }
}

export const clearExpensiveData = (key = null) => {
  try {
    if (!key) {
      localStorage.removeItem(EXPENSIVE_DATA_KEY)
      console.log('All expensive data cleared')
    } else {
      const savedData = localStorage.getItem(EXPENSIVE_DATA_KEY)
      if (savedData) {
        const dataStore = JSON.parse(savedData)
        delete dataStore[key]
        localStorage.setItem(EXPENSIVE_DATA_KEY, JSON.stringify(dataStore))
        console.log(`Expensive data cleared: ${key}`)
      }
    }
    return true
  } catch (error) {
    console.error('Failed to clear expensive data:', error)
    return false
  }
}

// Get a summary of saved states
export const getSavedStateSummary = () => {
  const wizardState = loadWizardState()
  const expensiveData = localStorage.getItem(EXPENSIVE_DATA_KEY)
  const expensiveDataStore = expensiveData ? JSON.parse(expensiveData) : {}
  
  return {
    hasWizardState: !!wizardState,
    currentStep: wizardState?.currentStep || null,
    productName: wizardState?.commercialData?.productName || null,
    savedAt: wizardState?.timestamp ? new Date(wizardState.timestamp) : null,
    expensiveDataKeys: Object.keys(expensiveDataStore),
    expensiveDataSummary: Object.entries(expensiveDataStore).map(([key, value]) => ({
      key,
      productName: value.productName,
      savedAt: new Date(value.timestamp)
    }))
  }
}
