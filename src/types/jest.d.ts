declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidCuid(): R;
    }
  }
}

export {};
