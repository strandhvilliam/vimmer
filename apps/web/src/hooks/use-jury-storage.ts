"use client";

import { useState, useEffect, useCallback } from "react";

interface UseJuryStorageReturn {
  selectedParticipantId: number | null;
  viewedParticipants: Set<number>;
  setSelectedParticipant: (participantId: number | null) => void;
  markParticipantAsViewed: (participantId: number) => void;
  clearSelectedParticipant: () => void;
  isParticipantViewed: (participantId: number) => boolean;
}

export function useJuryStorage(token: string): UseJuryStorageReturn {
  const [selectedParticipantId, setSelectedParticipantId] = useState<
    number | null
  >(null);
  const [viewedParticipants, setViewedParticipants] = useState<Set<number>>(
    new Set(),
  );

  const selectedParticipantKey = `jury-selected-participant-${token}`;
  const viewedParticipantsKey = `jury-viewed-participants-${token}`;

  // Load data from localStorage on mount
  useEffect(() => {
    // Load selected participant
    const storedSelected = localStorage.getItem(selectedParticipantKey);
    if (storedSelected) {
      setSelectedParticipantId(parseInt(storedSelected, 10));
    }

    // Load viewed participants
    const storedViewed = localStorage.getItem(viewedParticipantsKey);
    if (storedViewed) {
      try {
        const viewedIds = JSON.parse(storedViewed);
        setViewedParticipants(new Set(viewedIds));
      } catch {
        // Ignore parsing errors
      }
    }
  }, [token, selectedParticipantKey, viewedParticipantsKey]);

  // Save selected participant to localStorage
  useEffect(() => {
    if (selectedParticipantId !== null) {
      localStorage.setItem(
        selectedParticipantKey,
        selectedParticipantId.toString(),
      );
    }
  }, [selectedParticipantId, selectedParticipantKey]);

  // Save viewed participants to localStorage
  useEffect(() => {
    localStorage.setItem(
      viewedParticipantsKey,
      JSON.stringify(Array.from(viewedParticipants)),
    );
  }, [viewedParticipants, viewedParticipantsKey]);

  const setSelectedParticipant = useCallback((participantId: number | null) => {
    setSelectedParticipantId(participantId);
  }, []);

  const markParticipantAsViewed = useCallback((participantId: number) => {
    setViewedParticipants((prev) => new Set(prev).add(participantId));
  }, []);

  const clearSelectedParticipant = useCallback(() => {
    setSelectedParticipantId(null);
    localStorage.removeItem(selectedParticipantKey);
  }, [selectedParticipantKey]);

  const isParticipantViewed = useCallback(
    (participantId: number) => {
      return viewedParticipants.has(participantId);
    },
    [viewedParticipants],
  );

  return {
    selectedParticipantId,
    viewedParticipants,
    setSelectedParticipant,
    markParticipantAsViewed,
    clearSelectedParticipant,
    isParticipantViewed,
  };
}
