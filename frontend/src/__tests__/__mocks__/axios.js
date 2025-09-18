// Mock axios instance for testing
const mockAxios = {
  get: () => Promise.resolve({ data: {} }),
  post: () => Promise.resolve({ data: {} }),
  put: () => Promise.resolve({ data: {} }),
  delete: () => Promise.resolve({ data: {} }),
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  }
};

export default mockAxios;