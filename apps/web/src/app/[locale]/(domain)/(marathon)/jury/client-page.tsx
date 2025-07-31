"use client";

import { useState, useEffect, Suspense } from "react";
import { notFound } from "next/navigation";
import { ParticipantList } from "./_components/participant-list";
import { ParticipantSubmissions } from "./_components/participant-submissions";
import InitialView from "./_components/initial-view";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";

interface JuryClientPageProps {
  previewBaseUrl: string;
  token: string;
}

export function JuryClientPage({ previewBaseUrl, token }: JuryClientPageProps) {
  const trpc = useTRPC();
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);

  if (!token) {
    notFound();
  }

  const { data } = useSuspenseQuery(
    trpc.jury.verifyTokenAndGetData.queryOptions({
      token,
    }),
  );

  // Load selected participant from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`jury-selected-participant-${token}`);
    if (stored) {
      setSelectedParticipantId(parseInt(stored, 10));
    }
  }, [token]);

  // Save selected participant to localStorage
  useEffect(() => {
    if (selectedParticipantId !== null) {
      localStorage.setItem(
        `jury-selected-participant-${token}`,
        selectedParticipantId.toString(),
      );
    }
  }, [selectedParticipantId, token]);

  const handleParticipantSelect = (participantId: number) => {
    setSelectedParticipantId(participantId);
  };

  const handleBackToList = () => {
    setSelectedParticipantId(null);
    localStorage.removeItem(`jury-selected-participant-${token}`);
  };

  const { invitation } = data;

  return (
    <InitialView invitation={invitation}>
      {selectedParticipantId ? (
        <Suspense fallback={<div>Loading...</div>}>
          <ParticipantSubmissions
            token={token}
            participantId={selectedParticipantId}
            onBack={handleBackToList}
            baseUrl={previewBaseUrl}
          />
        </Suspense>
      ) : (
        <Suspense fallback={<ParticipantListLoading />}>
          <ParticipantList
            token={token}
            onParticipantSelect={handleParticipantSelect}
          />
        </Suspense>
      )}
    </InitialView>
  );
}

function ParticipantListLoading() {
  return (
    <main className="min-h-screen bg-neutral-950">
      <div className="flex w-full border-b items-center h-16 px-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 bg-neutral-800 rounded animate-pulse" />
          <div className="flex flex-col">
            <div className="h-5 w-48 bg-neutral-800 rounded animate-pulse mb-1" />
            <div className="h-3 w-32 bg-neutral-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="h-10 w-80 bg-neutral-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-neutral-900 border border-neutral-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-neutral-700 rounded-full animate-pulse" />
                  <div>
                    <div className="h-4 w-24 bg-neutral-700 rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-neutral-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-4 bg-neutral-700 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" />
              </div>
              <div className="flex gap-1">
                <div className="h-5 w-16 bg-neutral-700 rounded animate-pulse" />
                <div className="h-5 w-12 bg-neutral-700 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
