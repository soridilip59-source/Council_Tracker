import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
    });

    s.on("connect", () => {
      setIsConnected(true);
      console.log("[SocketContext] Connected to CouncilTrack real-time updates");
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("goal:created", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "goal:created",
          text: `New Goal created: "${data.goal.title}" by ${data.user?.name || "Member"}`,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    s.on("goal:completed", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "goal:completed",
          text: `🎉 Goal completed: "${data.goal.title}" (${data.council?.councilName || "Council"})`,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    s.on("progress:updated", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "progress:updated",
          text: `Progress updated on "${data.goal.title}": ${data.progress.percentage}%`,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    s.on("meeting:scheduled", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "meeting:scheduled",
          text: `📅 Meeting scheduled: "${data.meeting.title}" on ${data.meeting.meetingDate} at ${data.meeting.meetingTime}`,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    s.on("report:approved", (data) => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          type: "report:approved",
          text: `🏆 AI Performance Report finalized for ${data.user?.name || "Council Member"}`,
          time: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, notifications, clearNotifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
