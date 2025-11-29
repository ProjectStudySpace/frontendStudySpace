import { useState, useEffect } from "react";
import axios from "axios";
import { ProfileDashboard, DeleteAccountData } from "../src/types/profile";
import { api } from "../src/utils/axiosConfig";

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