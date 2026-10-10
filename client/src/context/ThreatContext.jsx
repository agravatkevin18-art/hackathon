import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { evaluateThreatMultiVector } from '../services/compositeThreatScorer.js';

const ThreatContext = createContext(null);

const MAX_HISTORY = 50;

const initialState = {
  scanHistory: [],
  totalScans: 0,
  totalThreatsBlocked: 0,
  totalSafeVerified: 0,
  averageLatency: 0,
  cloudBytesTransmitted: 0, // Always 0 — privacy proof
  sessionStartTime: new Date().toISOString(),
  activeScan: null,
  isScanning: false,
};

function threatReducer(state, action) {
  switch (action.type) {
    case 'START_SCAN':
      return { ...state, isScanning: true };

    case 'COMPLETE_SCAN': {
      const { result, inputType, inputPreview } = action.payload;
      const entry = {
        id: `scan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        inputType,
        inputPreview: inputPreview.slice(0, 120),
        compositeScore: result.compositeScore,
        verdict: result.verdict,
        latencyMs: result.totalLatencyMs,
        riskTitle: result.riskTitle,
        cuesCount: result.nlpResult?.cuesFound?.length || 0,
        urlFlags: result.urlResult?.flags?.length || 0,
      };

      const newHistory = [entry, ...state.scanHistory].slice(0, MAX_HISTORY);
      const newTotal = state.totalScans + 1;
      const isThreat = result.verdict === 'CRITICAL' || result.verdict === 'SUSPICIOUS';
      const newThreats = state.totalThreatsBlocked + (isThreat ? 1 : 0);
      const newSafe = state.totalSafeVerified + (!isThreat ? 1 : 0);
      const newAvgLatency =
        Math.round(
          ((state.averageLatency * state.totalScans + result.totalLatencyMs) / newTotal) * 100
        ) / 100;

      return {
        ...state,
        scanHistory: newHistory,
        totalScans: newTotal,
        totalThreatsBlocked: newThreats,
        totalSafeVerified: newSafe,
        averageLatency: newAvgLatency,
        activeScan: result,
        isScanning: false,
      };
    }

    case 'CLEAR_HISTORY':
      return {
        ...state,
        scanHistory: [],
        totalScans: 0,
        totalThreatsBlocked: 0,
        totalSafeVerified: 0,
        averageLatency: 0,
      };

    default:
      return state;
  }
}

export function ThreatProvider({ children }) {
  const [state, dispatch] = useReducer(threatReducer, initialState);

  const scanMessage = useCallback((text) => {
    dispatch({ type: 'START_SCAN' });
    // Simulating async with micro-delay for UI feedback
    const result = evaluateThreatMultiVector({ messageText: text });
    dispatch({
      type: 'COMPLETE_SCAN',
      payload: {
        result,
        inputType: 'message',
        inputPreview: text,
      },
    });
    return result;
  }, []);

  const scanUrl = useCallback((url) => {
    dispatch({ type: 'START_SCAN' });
    const result = evaluateThreatMultiVector({ urlString: url });
    dispatch({
      type: 'COMPLETE_SCAN',
      payload: {
        result,
        inputType: 'url',
        inputPreview: url,
      },
    });
    return result;
  }, []);

  const scanComposite = useCallback((params) => {
    dispatch({ type: 'START_SCAN' });
    const result = evaluateThreatMultiVector(params);
    dispatch({
      type: 'COMPLETE_SCAN',
      payload: {
        result,
        inputType: 'composite',
        inputPreview: params.messageText || params.urlString || 'APK Audit',
      },
    });
    return result;
  }, []);

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' });
  }, []);

  const value = {
    ...state,
    scanMessage,
    scanUrl,
    scanComposite,
    clearHistory,
  };

  return (
    <ThreatContext.Provider value={value}>
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreat() {
  const ctx = useContext(ThreatContext);
  if (!ctx) {
    throw new Error('useThreat must be used within a ThreatProvider');
  }
  return ctx;
}

export default ThreatContext;
