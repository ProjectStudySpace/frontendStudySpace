import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../src/config";
import { ProfileDashboard, DeleteAccountData } from "../src/types/profile";

const api = axios.create({
  baseURL: API_URL || "http://localhost:3000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useProfile = () => {
  const [profileData, setProfileData] = useState<ProfileDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/users/dashboard");
      
      if (data) {
        setProfileData(data);
      }
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setError("Error al cargar los datos del perfil");
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (deleteData: DeleteAccountData): Promise<boolean> => {
    try {
      await api.delete("/users/delete", {
        data: deleteData,
        withCredentials: true, // Incluye las cookies automáticamente
      });
      return true;
    } catch (err) {
      console.error("Error deleting account:", err);
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }
      throw new Error("Error al eliminar la cuenta");
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  return {
    profileData,
    loading,
    error,
    refetch: fetchProfileData,
    deleteAccount,
  };
};