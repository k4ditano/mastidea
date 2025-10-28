"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { IdeaInvitation } from "@/types";
import { FaBell, FaCheck, FaTimes, FaClock, FaEnvelope } from "react-icons/fa";
import Link from "next/link";

type InvitationFilter = "all" | "pending" | "accepted" | "rejected";

export default function InvitationsPage() {
  const t = useTranslations("invitations");
  const [invitations, setInvitations] = useState<IdeaInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InvitationFilter>("pending");

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      // TODO: Crear endpoint que traiga todas las invitaciones, no solo pendientes
      const response = await fetch("/api/invitations?all=true");
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
        // Refrescar la lista
        fetchInvitations();
      } else {
        const error = await response.json();
        alert(error.error || t("errorResponding"));
      }
    } catch (error) {
      console.error("Error responding to invitation:", error);
      alert(t("errorResponding"));
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === "all") return true;
    return inv.status === filter.toUpperCase();
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <FaClock className="text-xs" />
            {t("statusPending")}
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <FaCheck className="text-xs" />
            {t("statusAccepted")}
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <FaTimes className="text-xs" />
            {t("statusRejected")}
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-einstein-100 rounded-full mb-4">
            <FaBell className="text-3xl text-einstein-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 justify-center flex-wrap">
          {(["all", "pending", "accepted", "rejected"] as InvitationFilter[]).map(
            (f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === f
                    ? "bg-einstein-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {t(`filter${f.charAt(0).toUpperCase() + f.slice(1)}`)}
              </button>
            )
          )}
        </div>

        {/* Invitations List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-einstein-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t("loading")}</p>
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaEnvelope className="text-5xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600">{t("noInvitations")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {invitation.idea?.title || t("unknownIdea")}
                      </h3>
                      {getStatusBadge(invitation.status)}
                    </div>
                    <p className="text-gray-600">
                      {t("invitedBy")}{" "}
                      <span className="font-medium">
                        {invitation.inviterName || invitation.inviterUserId}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(invitation.createdAt)}
                    </p>
                  </div>
                </div>

                {invitation.message && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 italic">
                      &ldquo;{invitation.message}&rdquo;
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  {invitation.status === "PENDING" ? (
                    <>
                      <button
                        onClick={() => handleResponse(invitation.id, "accept")}
                        className="flex-1 px-4 py-2 bg-einstein-600 hover:bg-einstein-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaCheck />
                        {t("accept")}
                      </button>
                      <button
                        onClick={() => handleResponse(invitation.id, "reject")}
                        className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <FaTimes />
                        {t("reject")}
                      </button>
                    </>
                  ) : invitation.status === "ACCEPTED" && invitation.idea ? (
                    <Link
                      href={`/idea/${invitation.idea.id}`}
                      className="flex-1 px-4 py-2 bg-einstein-600 hover:bg-einstein-700 text-white rounded-lg font-medium transition-colors text-center"
                    >
                      {t("viewIdea")}
                    </Link>
                  ) : invitation.status === "REJECTED" ? (
                    <p className="text-sm text-gray-500 italic">
                      {t("rejectedOn")}{" "}
                      {invitation.respondedAt
                        ? formatDate(invitation.respondedAt)
                        : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
