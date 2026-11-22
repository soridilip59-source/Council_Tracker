import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { councilApi } from "../services/api";

const CouncilContext = createContext(null);

export function CouncilProvider({ children }) {
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCouncils = useCallback(async () => {
    try {
      setLoading(true);
      const res = await councilApi.getAll();
      const loaded = res.data.data || [];
      // Normalize format to support both schema types
      const normalized = loaded.map((c) => ({
        id: c.councilId,
        councilId: c.councilId,
        name: c.councilName,
        councilName: c.councilName,
        description: c.description || "",
        category: c.category || "General",
        designation: c.designation || "Council Lead",
        members: c.members || [],
        status: c.status || "active",
      }));
      setCouncils(normalized);
    } catch (err) {
      console.error("Failed to load councils:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCouncils();
  }, [fetchCouncils]);

  const addCouncil = async (council) => {
    try {
      await councilApi.create({
        councilName: council.name || council.councilName,
        description: council.description || "",
      });
      fetchCouncils();
    } catch (err) {
      console.error("Failed to add council:", err);
    }
  };

  const deleteCouncil = async (id) => {
    fetchCouncils();
  };

  const updateCouncil = async (id, updates) => {
    try {
      await councilApi.update(id, updates);
      fetchCouncils();
    } catch (err) {
      console.error("Failed to update council:", err);
    }
  };

  const addMember = async (councilId, name) => {
    fetchCouncils();
  };

  const removeMember = async (councilId, memberId) => {
    fetchCouncils();
  };

  return (
    <CouncilContext.Provider
      value={{
        councils,
        setCouncils,
        loading,
        refreshCouncils: fetchCouncils,
        addCouncil,
        deleteCouncil,
        updateCouncil,
        addMember,
        removeMember,
      }}
    >
      {children}
    </CouncilContext.Provider>
  );
}

export function useCouncils() {
  const context = useContext(CouncilContext);
  if (!context) {
    throw new Error("useCouncils must be used within a CouncilProvider");
  }
  return context;
}
