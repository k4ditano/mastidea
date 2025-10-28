"use client";

import { useState, useEffect } from "react";
import { IdeaInvitation } from "@/types";

export default function InvitationNotifications() {
  const [invitations, setInvitations] = useState<IdeaInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
    // Polling cada 30 segundos para nuevas invitaciones
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch("/api/invitations");
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error("Error fetching invitations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (
    invitationId: string,
    action: "accept" | "reject"
  ) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        // Remover la invitación de la lista
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
      } else {
        const error = await response.json();
        alert(error.error || "Error al procesar la invitación");
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      alert("Error al procesar la invitación");
    }
  };

  if (loading) {
    return null;
  }

  if (invitations.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md space-y-2">
      {invitations.map((invitation) => (
        <div
          key={invitation.id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 animate-slide-up"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Invitación a colaborar
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {invitation.inviterName} te invita a colaborar en:
              </p>
              <p className="font-medium text-gray-900 dark:text-white mt-2">
                {invitation.idea?.title}
              </p>
              {invitation.message && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                  &ldquo;{invitation.message}&rdquo;
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleResponse(invitation.id, "accept")}
              className="flex-1 px-4 py-2 bg-einstein-600 hover:bg-einstein-700 text-white rounded-lg font-medium transition-colors"
            >
              Aceptar
            </button>
            <button
              onClick={() => handleResponse(invitation.id, "reject")}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
            >
              Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
