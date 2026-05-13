import numpy as np
from typing import List, Dict

class PortfolioAnalytics:
    """NumPy yordamida portfelni tahlil qilish klassi"""

    @staticmethod
    def calculate_pnl(amounts: List[float], buy_prices: List[float], current_prices: List[float]) -> Dict:
        """
        Umumiy foyda va zararni (P&L) hisoblash.
        """
        # Listlarni NumPy arraylariga o'tkazamiz
        amounts_arr = np.array(amounts)
        buy_prices_arr = np.array(buy_prices)
        current_prices_arr = np.array(current_prices)

        # Investitsiya qilingan jami mablag'
        total_invested = np.sum(amounts_arr * buy_prices_arr)
        
        # Portfelning hozirgi qiymati
        current_total_value = np.sum(amounts_arr * current_prices_arr)

        # Absolut foyda/zarar
        pnl_absolute = current_total_value - total_invested

        # Foizdagi foyda/zarar
        pnl_percentage = (pnl_absolute / total_invested * 100) if total_invested > 0 else 0.0

        return {
            "total_invested": float(total_invested),
            "current_value": float(current_total_value),
            "pnl_absolute": float(pnl_absolute),
            "pnl_percentage": float(pnl_percentage)
        }

    @staticmethod
    def get_allocation(amounts: List[float], current_prices: List[float], symbols: List[str]) -> Dict[str, float]:
        """
        Aktivlar taqsimotini (%) hisoblash.
        """
        values = np.array(amounts) * np.array(current_prices)
        total_value = np.sum(values)
        
        if total_value == 0:
            return {symbol: 0.0 for symbol in symbols}
            
        allocations = (values / total_value) * 100
        return dict(zip(symbols, allocations.tolist()))

    @staticmethod
    def calculate_weighted_average_price(transactions_amounts: List[float], transactions_prices: List[float]) -> float:
        """
        O'rtacha sotib olish narxini (Weighted Average) hisoblash.
        """
        amounts = np.array(transactions_amounts)
        prices = np.array(transactions_prices)
        
        if np.sum(amounts) == 0:
            return 0.0
            
        return float(np.average(prices, weights=amounts))
