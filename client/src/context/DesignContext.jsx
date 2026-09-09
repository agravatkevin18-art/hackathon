import React, { createContext, useContext, useEffect, useState } from 'react';

const DesignContext = createContext(null);
const CURRENT_KEY = 'idp_current';
const SAVED_KEY = 'idp_designs';

const initial = {
  roomType: '',
  roomName: '',
  length: '',
  width: '',
  height: '',
  wallColor: null,
  furniture: [],
  lighting: [],
  flooring: null
};

function loadCurrent() {
  try {
    const raw = localStorage.getItem(CURRENT_KEY);
    if (raw) return { ...initial, ...JSON.parse(raw) };
  } catch {}
  return initial;
}

export function DesignProvider({ children }) {
  const [design, setDesign] = useState(loadCurrent);
  const [savedDesigns, setSavedDesigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(CURRENT_KEY, JSON.stringify(design));
  }, [design]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedDesigns));
  }, [savedDesigns]);

  const update = (patch) => setDesign((d) => ({ ...d, ...patch }));

  const toggleItem = (key, item) => {
    setDesign((d) => {
      const list = d[key] || [];
      const exists = list.some((x) => x.id === item.id);
      return { ...d, [key]: exists ? list.filter((x) => x.id !== item.id) : [...list, item] };
    });
  };

  const reset = () => setDesign(initial);

  const saveDesign = () => {
    const entry = {
      ...design,
      id: Date.now(),
      date: new Date().toLocaleString('en-IN')
    };
    setSavedDesigns((s) => [entry, ...s]);
    return entry;
  };

  const deleteSaved = (id) => setSavedDesigns((s) => s.filter((x) => x.id !== id));

  const loadSaved = (id) => {
    const found = savedDesigns.find((x) => x.id === id);
    if (found) {
      const { id: _i, date: _d, ...rest } = found;
      setDesign({ ...initial, ...rest });
    }
  };

  return (
    <DesignContext.Provider value={{ design, update, toggleItem, reset, savedDesigns, saveDesign, deleteSaved, loadSaved }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  return useContext(DesignContext);
}
