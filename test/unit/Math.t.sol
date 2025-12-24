// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {Math} from "../../contracts/libraries/Math.sol";

contract MathTest is Test {
    // Constants
    uint256 constant WAD = 1e18;
    uint256 constant BASIS_POINTS = 10000;

    // ============= Position Size Tests =============

    function test_CalculatePositionSize() public {
        uint256 collateral = 1000e18; // 1000 USD
        uint256 leverage = 5;
        uint256 expected = 5000e18; // 5000 USD

        uint256 result = Math.calculatePositionSize(collateral, leverage);
        assertEq(result, expected);
    }

    function test_CalculatePositionSize_MaxLeverage() public {
        uint256 collateral = 100e18;
        uint256 leverage = 40;
        uint256 expected = 4000e18;

        uint256 result = Math.calculatePositionSize(collateral, leverage);
        assertEq(result, expected);
    }

    function test_CalculatePositionSize_RevertInvalidLeverage() public {
        uint256 collateral = 1000e18;

        vm.expectRevert("Invalid leverage");
        Math.calculatePositionSize(collateral, 0);

        vm.expectRevert("Invalid leverage");
        Math.calculatePositionSize(collateral, 41);
    }

    // ============= Long PnL Tests =============

    function test_CalculateLongPnL_Profit() public {
        uint256 entryPrice = 50000e18; // $50,000
        uint256 exitPrice = 55000e18; // $55,000
        uint256 positionSize = 100e18; // 100 USD worth

        int256 pnl = Math.calculateLongPnL(entryPrice, exitPrice, positionSize);

        // (55000 - 50000) / 50000 * 100 = 10
        assertEq(pnl, 10e18);
    }

    function test_CalculateLongPnL_Loss() public {
        uint256 entryPrice = 50000e18;
        uint256 exitPrice = 45000e18;
        uint256 positionSize = 100e18;

        int256 pnl = Math.calculateLongPnL(entryPrice, exitPrice, positionSize);

        // (45000 - 50000) / 50000 * 100 = -10
        assertEq(pnl, -10e18);
    }

    function test_CalculateLongPnL_NoChange() public {
        uint256 entryPrice = 50000e18;
        uint256 exitPrice = 50000e18;
        uint256 positionSize = 100e18;

        int256 pnl = Math.calculateLongPnL(entryPrice, exitPrice, positionSize);
        assertEq(pnl, 0);
    }

    // ============= Short PnL Tests =============

    function test_CalculateShortPnL_Profit() public {
        uint256 entryPrice = 50000e18; // Shorted at $50,000
        uint256 exitPrice = 45000e18; // Price fell to $45,000
        uint256 positionSize = 100e18;

        int256 pnl = Math.calculateShortPnL(entryPrice, exitPrice, positionSize);

        // (50000 - 45000) / 50000 * 100 = 10
        assertEq(pnl, 10e18);
    }

    function test_CalculateShortPnL_Loss() public {
        uint256 entryPrice = 50000e18;
        uint256 exitPrice = 55000e18;
        uint256 positionSize = 100e18;

        int256 pnl = Math.calculateShortPnL(entryPrice, exitPrice, positionSize);

        // (50000 - 55000) / 50000 * 100 = -10
        assertEq(pnl, -10e18);
    }

    // ============= Margin Ratio Tests (perpX-inspired) =============

    function test_CalculateMarginRatio_Healthy() public {
        int256 equity = 1000e18;
        uint256 positionSize = 5000e18;

        int256 marginRatio = Math.calculateMarginRatio(equity, positionSize);

        // (1000 * 10000) / 5000 = 2000 bps (20%)
        assertEq(marginRatio, 2000);
    }

    function test_CalculateMarginRatio_Liquidatable() public {
        int256 equity = 100e18;
        uint256 positionSize = 5000e18;

        int256 marginRatio = Math.calculateMarginRatio(equity, positionSize);

        // (100 * 10000) / 5000 = 200 bps (2%)
        assertEq(marginRatio, 200);
    }

    function test_CalculateMarginRatio_Negative() public {
        int256 equity = -500e18; // Underwater
        uint256 positionSize = 5000e18;

        int256 marginRatio = Math.calculateMarginRatio(equity, positionSize);

        // (-500 * 10000) / 5000 = -1000 bps (-10%)
        assertEq(marginRatio, -1000);
    }

    // ============= Equity Calculation Tests (perpX-inspired) =============

    function test_CalculateEquity() public {
        uint256 collateral = 1000e18;
        int256 pnl = 100e18;
        int256 accumulatedFunding = 50e18;

        int256 equity = Math.calculateEquity(collateral, pnl, accumulatedFunding);

        assertEq(equity, 1150e18);
    }

    function test_CalculateEquity_WithNegativePnL() public {
        uint256 collateral = 1000e18;
        int256 pnl = -200e18;
        int256 accumulatedFunding = 0;

        int256 equity = Math.calculateEquity(collateral, pnl, accumulatedFunding);

        assertEq(equity, 800e18);
    }

    function test_CalculateEquity_Underwater() public {
        uint256 collateral = 500e18;
        int256 pnl = -600e18;
        int256 accumulatedFunding = 0;

        int256 equity = Math.calculateEquity(collateral, pnl, accumulatedFunding);

        assertEq(equity, -100e18); // Negative equity (liquidatable)
    }

    // ============= Maintenance Margin Tests =============

    function test_GetMaintenanceMargin_1x() public {
        uint256 mm = Math.getMaintenanceMargin(1);
        assertEq(mm, 80); // 80%
    }

    function test_GetMaintenanceMargin_5x() public {
        uint256 mm = Math.getMaintenanceMargin(5);
        assertEq(mm, 70); // 70%
    }

    function test_GetMaintenanceMargin_10x() public {
        uint256 mm = Math.getMaintenanceMargin(10);
        assertEq(mm, 60); // 60%
    }

    function test_GetMaintenanceMargin_20x() public {
        uint256 mm = Math.getMaintenanceMargin(20);
        assertEq(mm, 50); // 50%
    }

    function test_GetMaintenanceMargin_40x() public {
        uint256 mm = Math.getMaintenanceMargin(40);
        assertEq(mm, 50); // 50%
    }

    // ============= Maintenance Margin BPS Tests (perpX-style) =============

    function test_GetMaintenanceMarginBps_1x() public {
        uint256 mmBps = Math.getMaintenanceMarginBps(1);
        assertEq(mmBps, 5000); // 50%
    }

    function test_GetMaintenanceMarginBps_5x() public {
        uint256 mmBps = Math.getMaintenanceMarginBps(5);
        assertEq(mmBps, 1000); // 10%
    }

    function test_GetMaintenanceMarginBps_10x() public {
        uint256 mmBps = Math.getMaintenanceMarginBps(10);
        assertEq(mmBps, 500); // 5%
    }

    function test_GetMaintenanceMarginBps_40x() public {
        uint256 mmBps = Math.getMaintenanceMarginBps(40);
        assertEq(mmBps, 125); // 1.25%
    }

    // ============= Imbalance Calculation Tests =============

    function test_CalculateImbalance_Balanced() public {
        uint256 longOI = 5000e18;
        uint256 shortOI = 5000e18;

        (int256 netOI, uint256 imbalanceBps) = Math.calculateImbalance(longOI, shortOI);

        assertEq(netOI, 0);
        assertEq(imbalanceBps, 5000); // 50% (perfectly balanced)
    }

    function test_CalculateImbalance_LongSkewed() public {
        uint256 longOI = 7500e18;
        uint256 shortOI = 2500e18;

        (int256 netOI, uint256 imbalanceBps) = Math.calculateImbalance(longOI, shortOI);

        assertEq(netOI, 5000e18);
        assertEq(imbalanceBps, 7500); // 75% (heavily long)
    }

    function test_CalculateImbalance_ShortSkewed() public {
        uint256 longOI = 2500e18;
        uint256 shortOI = 7500e18;

        (int256 netOI, uint256 imbalanceBps) = Math.calculateImbalance(longOI, shortOI);

        assertEq(netOI, -5000e18);
        assertEq(imbalanceBps, 2500); // 25% (heavily short)
    }

    function test_CalculateImbalance_NoOI() public {
        uint256 longOI = 0;
        uint256 shortOI = 0;

        (int256 netOI, uint256 imbalanceBps) = Math.calculateImbalance(longOI, shortOI);

        assertEq(netOI, 0);
        assertEq(imbalanceBps, 5000); // Default to balanced
    }

    // ============= Price Impact Tests =============

    function test_CalculatePriceImpact_Balanced() public {
        uint256 imbalanceBps = 5000; // Perfectly balanced
        uint256 baseSpread = 50; // 0.5%

        uint256 impact = Math.calculatePriceImpact(imbalanceBps, baseSpread);

        assertEq(impact, 50); // No additional impact
    }

    function test_CalculatePriceImpact_Skewed() public {
        uint256 imbalanceBps = 7500; // 75% long
        uint256 baseSpread = 50;

        uint256 impact = Math.calculatePriceImpact(imbalanceBps, baseSpread);

        // Deviation = 2500, additional spread = 2500 / 10 = 250
        assertEq(impact, 300);
    }

    // ============= Liquidation Tests =============

    function test_IsPositionLiquidatable_Long_NotLiquidatable() public {
        uint256 collateral = 1000e18;
        uint256 leverage = 5;
        uint256 entryPrice = 50000e18;
        uint256 currentPrice = 49000e18; // 2% loss

        bool liquidatable = Math.isPositionLiquidatable(
            collateral,
            leverage,
            entryPrice,
            currentPrice,
            true
        );

        assertFalse(liquidatable); // Position healthy
    }

    function test_IsPositionLiquidatable_Long_Liquidatable() public {
        uint256 collateral = 1000e18;
        uint256 leverage = 10;
        uint256 entryPrice = 50000e18;
        uint256 currentPrice = 47500e18; // 5% loss = underwater

        bool liquidatable = Math.isPositionLiquidatable(
            collateral,
            leverage,
            entryPrice,
            currentPrice,
            true
        );

        assertTrue(liquidatable);
    }

    function test_IsPositionLiquidatable_Short_NotLiquidatable() public {
        uint256 collateral = 1000e18;
        uint256 leverage = 5;
        uint256 entryPrice = 50000e18;
        uint256 currentPrice = 51000e18; // 2% loss on short

        bool liquidatable = Math.isPositionLiquidatable(
            collateral,
            leverage,
            entryPrice,
            currentPrice,
            false
        );

        assertFalse(liquidatable);
    }

    function test_IsPositionLiquidatable_Short_Liquidatable() public {
        uint256 collateral = 1000e18;
        uint256 leverage = 10;
        uint256 entryPrice = 50000e18;
        uint256 currentPrice = 52500e18; // 5% loss = underwater

        bool liquidatable = Math.isPositionLiquidatable(
            collateral,
            leverage,
            entryPrice,
            currentPrice,
            false
        );

        assertTrue(liquidatable);
    }

    // ============= Decimal Conversion Tests =============

    function test_WadToPyth() public {
        uint256 wad = 1e18;
        uint256 pyth = Math.wadToPyth(wad);
        assertEq(pyth, 1e8);
    }

    function test_PythToWad() public {
        uint256 pyth = 1e8;
        uint256 wad = Math.pythToWad(pyth);
        assertEq(wad, 1e18);
    }

    function test_Conversion_RoundTrip() public {
        uint256 original = 12345e18;
        uint256 converted = Math.wadToPyth(original);
        uint256 back = Math.pythToWad(converted);
        assertEq(back, original);
    }

    // ============= Precise PnL Tests =============

    function test_CalculatePnLPrecise_Long_Profit() public {
        uint256 positionSize = 100e18;
        uint256 entryPrice = 50000e18;
        uint256 exitPrice = 55000e18;

        int256 pnl = Math.calculatePnLPrecise(positionSize, entryPrice, exitPrice, true);

        // (55000 - 50000) / 50000 * 100 = 10
        assertEq(pnl, 10e18);
    }

    function test_CalculatePnLPrecise_Short_Loss() public {
        uint256 positionSize = 100e18;
        uint256 entryPrice = 50000e18;
        uint256 exitPrice = 55000e18;

        int256 pnl = Math.calculatePnLPrecise(positionSize, entryPrice, exitPrice, false);

        // (50000 - 55000) / 50000 * 100 = -10
        assertEq(pnl, -10e18);
    }

    // ============= Margin Below Maintenance Tests (perpX logic) =============

    function test_IsMarginBelowMaintenance_Healthy() public {
        int256 equity = 1000e18;
        uint256 positionSize = 5000e18;
        uint256 maintenanceMarginBps = 500; // 5%

        // marginRatio = 2000 bps (20%)
        // 2000 >= 500 → not below
        bool below = Math.isMarginBelowMaintenance(equity, positionSize, maintenanceMarginBps);

        assertFalse(below);
    }

    function test_IsMarginBelowMaintenance_Liquidatable() public {
        int256 equity = 100e18;
        uint256 positionSize = 5000e18;
        uint256 maintenanceMarginBps = 500; // 5%

        // marginRatio = 200 bps (2%)
        // 200 < 500 → below (liquidatable)
        bool below = Math.isMarginBelowMaintenance(equity, positionSize, maintenanceMarginBps);

        assertTrue(below);
    }
}
