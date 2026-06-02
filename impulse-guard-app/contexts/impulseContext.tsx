import React, { createContext, useContext, useState } from "react";

interface ImpulseContextType {
  selectedImpulseId: string | null;
  setSelectedImpulseId: React.Dispatch<React.SetStateAction<string | null>>;
}

const ImpulseContext = createContext<ImpulseContextType | undefined>(undefined);

export function ImpulseProvider({ children }: any) {
  const [selectedImpulseId, setSelectedImpulseId] = useState<string | null>(
    null
  );

  return (
    <ImpulseContext.Provider
      value={{ selectedImpulseId, setSelectedImpulseId }}
    >
      {children}
    </ImpulseContext.Provider>
  );
}

export function useImpulse() {
  const context = useContext(ImpulseContext);
  if (!context) {
    throw new Error("useImpulse must be used within an ImpulseProvider");
  }
  return context;
}
