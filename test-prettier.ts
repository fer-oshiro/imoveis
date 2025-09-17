// Test file to verify Prettier formatting
const testFunction = (param1: string, param2: number, param3: boolean) => {
  if (param1 && param2 > 0 && param3) {
    console.log('This should be formatted by Prettier')
  }
  return { param1, param2, param3 }
}

export default testFunction
