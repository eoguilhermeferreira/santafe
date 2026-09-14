/**
 * Corre uma consulta com um teto de tempo — se a consulta (ou a rede até o
 * Supabase) travar, cai no valor de fallback em vez de deixar a página
 * inteira estourar o timeout da Vercel e virar "Gateway Timeout" (erro 500).
 * A promise original não é cancelada, só deixamos de esperar por ela.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      () => {
        clearTimeout(timer);
        resolve(fallback);
      }
    );
  });
}
