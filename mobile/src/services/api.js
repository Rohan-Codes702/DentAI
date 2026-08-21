import axiosInstance from '../config/axios';

export const handleApiError = (error, options = {}) => {
  const serverErrors = error?.response?.data?.errors;
  let message = error?.response?.data?.message || error.message || 'An unexpected error occurred';
  if (Array.isArray(serverErrors) && serverErrors.length > 0) {
    const details = serverErrors.map((e) => e.message || `${e.field}: invalid`).join('; ');
    message = `${message} (${details})`;
  }
  if (!options.quiet && error?.response?.status !== 404) {
    console.error('API Error:', message);
  }
  const err = new Error(message);
  err.status = error?.response?.status;
  throw err;
};

export const get = async (url, params = {}) => {
  try {
    const response = await axiosInstance.get(url, { params });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const post = async (url, data = {}, headers = {}) => {
  try {
    const requestHeaders = data instanceof FormData
      ? Object.fromEntries(
          Object.entries(headers).filter(([key]) => key.toLowerCase() !== 'content-type')
        )
      : headers;
    const response = await axiosInstance.post(url, data, { headers: requestHeaders });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const put = async (url, data = {}, headers = {}) => {
  try {
    const requestHeaders = data instanceof FormData
      ? Object.fromEntries(
          Object.entries(headers).filter(([key]) => key.toLowerCase() !== 'content-type')
        )
      : headers;
    const response = await axiosInstance.put(url, data, { headers: requestHeaders });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const del = async (url) => {
  try {
    const response = await axiosInstance.delete(url);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};
