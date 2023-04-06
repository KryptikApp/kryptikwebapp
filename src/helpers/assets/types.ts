/** Interface for price data.
 * @property {number[]} prices - Array of prices.
 * @property {number[]} times - Array of times.
 * @property {number} lookback - Number of days to look back.
 * @property {string} id - Id of the asset. Coingecko id at the moment.
 */
export interface IHistoricalPrice {
  prices: number[];
  times: number[];
  lookback: number;
  id: string;
}
