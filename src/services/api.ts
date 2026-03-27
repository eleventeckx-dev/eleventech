import { Load, Producer, Company } from '../types';

// TODO: Futura integração com Supabase
// import { supabase } from '../lib/supabase'

export const LoadService = {
  async getLoads(companyId: string): Promise<Load[]> {
    // const { data } = await supabase.from('loads').select('*').eq('companyId', companyId);
    // return data;
    return [];
  },
  
  async createLoad(loadData: Partial<Load>): Promise<Load> {
    // const { data } = await supabase.from('loads').insert(loadData).single();
    // return data;
    return {} as Load;
  },

  async updateLoad(id: string, updates: Partial<Load>): Promise<Load> {
    // const { data } = await supabase.from('loads').update(updates).eq('id', id).single();
    // return data;
    return {} as Load;
  }
};

export const ProducerService = {
  async getProducers(companyId: string): Promise<Producer[]> {
    // const { data } = await supabase.from('producers').select('*').eq('companyId', companyId);
    // return data;
    return [];
  }
};