const fetchAllServices = async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/services`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
  }
};
export default fetchAllServices;
