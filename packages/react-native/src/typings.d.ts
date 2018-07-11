declare module 'mock-async-storage' {
  import { AsyncStorage } from 'react-native'
  const MockAsyncStorage: { new(): AsyncStorage }
  export default MockAsyncStorage
}
