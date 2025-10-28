"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { FaClock, FaTimes, FaEnvelopeOpen } from "react-icons/fa";

interface PendingInvitation {
  id: string;
  invitedEmail: string;
  message?: string;
  createdAt: string;
  status: string;
}

interface PendingInvitationsProps {
  ideaId: string;
  isOwner: boolean;
}

export default function PendingInvitations({
  ideaId,
  isOwner,
}: PendingInvitationsProps) {
  const t = useTranslations("collaboration");
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/invitations`);
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

  useEffect(() => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId, isOwner]);

  const handleCancelInvitation = async (invitationId: string) => {
    if (!confirm(t("confirmCancelInvitation"))) return;

    try {
      const response = await fetch(
        `/api/ideas/${ideaId}/invitations/${invitationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setInvitations(invitations.filter((inv) => inv.id !== invitationId));
      } else {
        alert(t("errorCanceling"));
      }
    } catch (error) {
      console.error("Error canceling invitation:", error);
      alert(t("errorCanceling"));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isOwner) return null;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <FaEnvelopeOpen className="text-yellow-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900">
          {t("pendingInvitations")} ({invitations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {invitations.map((invitation) => (
          <div
            key={invitation.id}
            className="flex items-start justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FaClock className="text-yellow-600 text-sm" />
                <p className="font-medium text-gray-900">
                  {invitation.invitedEmail}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {t("sentOn")} {formatDate(invitation.createdAt)}
              </p>
              {invitation.message && (
                <p className="text-sm text-gray-700 mt-2 italic">
                  &ldquo;{invitation.message}&rdquo;
                </p>
              )}
            </div>
            <button
              onClick={() => handleCancelInvitation(invitation.id)}
              className="ml-4 p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title={t("cancelInvitation")}
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4">{t("invitationsPendingNote")}</p>
    </div>
  );
}
