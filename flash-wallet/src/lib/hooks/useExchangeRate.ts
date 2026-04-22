/**
 * Hook placeholder pour le taux de change.
 * Le taux réel viendra de l'API Flash quand l'endpoint sera disponible.
 */
export function useExchangeRate() {
  // Taux approximatif en attendant l'endpoint /rates
  const XOF_PER_SAT = 0.38;

  return {
    rate: XOF_PER_SAT,
    isLoading: false,
    error: null,
  };
}
