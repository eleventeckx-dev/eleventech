import React, { createContext, useContext, useState } from 'react';
import { Load, Producer, User, Company } from '../types';
import { MOCK_LOADS, MOCK_PRODUCERS, MOCK_USERS, MOCK_COMPANIES } from '../data/mock';

interface AgroContextData {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  loads: Load[];
  producers: Producer[];
  companies: Company[];
  addLoad: (load: Load) => void;
  updateLoad: (id: string, load: Partial<Load>) => void;
  addProducer: (producer: Producer) => void;
  addCompany: (company: Company) => void;
  updateCompany: (id: string, company: Partial<Company>) => void;
}

const AgroContext = createContext<AgroContextData>({} as AgroContextData);

export const AgroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loads, setLoads] = useState<Load[]>(MOCK_LOADS);
  const [producers, setProducers] = useState<Producer[]>(MOCK_PRODUCERS);
  const [companies, setCompanies] = useState<Company[]>(MOCK_COMPANIES);

  const addLoad = (load: Load) => setLoads([load, ...loads]);
  
  const updateLoad = (id: string, updates: Partial<Load>) => {
    setLoads(loads.map(l => l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l));
  };

  const addProducer = (producer: Producer) => setProducers([...producers, producer]);

  const addCompany = (company: Company) => setCompanies([company, ...companies]);
  
  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c));
  };

  return (
    <AgroContext.Provider value={{ 
      currentUser, setCurrentUser, 
      loads, producers, companies, 
      addLoad, updateLoad, addProducer, 
      addCompany, updateCompany 
    }}>
      {children}
    </AgroContext.Provider>
  );
};

export const useAgro = () => useContext(AgroContext);