import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const fetchStaff = async () => {
  try {
    const res = await axios.get(`${apiUrl}/api/staff`);
    const data = res.data;
    return data;
  } catch (error) {
    console.error("Error fetching staff:", error);
  }
};

export default fetchStaff;
