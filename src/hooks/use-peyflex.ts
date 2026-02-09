import { useQuery, useQueries } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = "https://hdhnxjjnkordeqfjecjk.supabase.co";

async function peyflexFetch(action: string, params?: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const url = new URL(`${SUPABASE_URL}/functions/v1/peyflex-proxy`);
  url.searchParams.set('action', action);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export interface PeyflexDataPlan {
  plan_code: string;
  name: string;
  size: string;
  amount: number;
  validity: string;
  peyflex_network: string;
  category: string;
}

// Network ID mapping: our app network -> peyflex network categories
const NETWORK_MAP: Record<string, string[]> = {
  mtn: ['mtn_sme_data', 'mtn_gifting_data'],
  airtel: ['airtel_data'],
  glo: ['glo_data'],
  '9mobile': ['9mobile_data'],
};

export function useAllDataPlansForNetwork(network: string | null) {
  const networkIds = network ? (NETWORK_MAP[network] || []) : [];

  const queries = useQueries({
    queries: networkIds.map(nid => ({
      queryKey: ['peyflex', 'data-plans', nid],
      queryFn: () => peyflexFetch('data-plans', { network: nid }),
      enabled: !!network,
      staleTime: 1000 * 60 * 10,
    })),
  });

  const isLoading = queries.some(q => q.isLoading);
  const isError = queries.some(q => q.isError);

  const plans: PeyflexDataPlan[] = [];
  queries.forEach((q, i) => {
    if (q.data && Array.isArray(q.data)) {
      const nid = networkIds[i];
      const category = nid.includes('sme') ? 'SME' 
        : nid.includes('gifting') ? 'Gifting' 
        : nid.includes('corporate') ? 'Corporate' 
        : 'Data';
      q.data.forEach((p: any) => {
        plans.push({
          plan_code: p.plan_code || p.id,
          name: p.name || p.plan_name || '',
          size: p.size || p.plan_name || '',
          amount: Number(p.amount || p.price || 0),
          validity: p.validity || p.duration || '30 days',
          peyflex_network: nid,
          category,
        });
      });
    }
  });

  return { plans, isLoading, isError };
}

export { peyflexFetch };
