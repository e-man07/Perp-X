// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {PositionManager, PositionDirection, PositionStatus} from "../../contracts/core/PositionManager.sol";
import {IPositionManager} from "../../contracts/interfaces/IPositionManager.sol";

contract PositionManagerTest is Test {
    PositionManager positionManager;
    address market = address(0x1);
    address user = address(0x2);
    address otherMarket = address(0x3);

    function setUp() public {
        positionManager = new PositionManager();

        // Authorize market
        positionManager.authorizeMarket(market, true);
        positionManager.authorizeMarket(otherMarket, true);
    }

    // ============= Position Creation Tests =============

    function test_CreatePosition() public {
        uint256 collateral = 1000e18;
        uint256 leverage = 5;
        uint256 entryPrice = 50000e18;

        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            collateral,
            leverage,
            entryPrice
        );

        assertEq(positionId, 1);
    }

    function test_CreatePosition_MultiplePositions() public {
        // Create first position
        uint256 id1 = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        // Create second position
        uint256 id2 = positionManager.createPosition(
            user,
            market,
            PositionDirection.SHORT,
            500e18,
            10,
            50000e18
        );

        assertEq(id1, 1);
        assertEq(id2, 2);
    }

    function test_CreatePosition_RevertUnauthorized() public {
        address unauthorizedMarket = address(0x99);

        vm.expectRevert("Only authorized markets");
        positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        // Switch to unauthorized market
        vm.prank(unauthorizedMarket);
        vm.expectRevert("Only authorized markets");
        positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );
    }

    function test_CreatePosition_RevertInvalidLeverage() public {
        vm.prank(market);
        vm.expectRevert("Invalid leverage");
        positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            0, // Invalid
            50000e18
        );

        vm.prank(market);
        vm.expectRevert("Invalid leverage");
        positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            41, // Too high
            50000e18
        );
    }

    // ============= Position Retrieval Tests =============

    function test_GetPosition() public {
        uint256 leverage = 5;
        uint256 collateral = 1000e18;
        uint256 entryPrice = 50000e18;

        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            collateral,
            leverage,
            entryPrice
        );

        IPositionManager.Position memory position = positionManager.getPosition(positionId);

        assertEq(position.id, positionId);
        assertEq(position.user, user);
        assertEq(position.market, market);
        assertEq(position.collateralUSD, collateral);
        assertEq(position.leverage, leverage);
        assertEq(position.entryPrice, entryPrice);
        assertEq(position.positionSize, collateral * leverage);
        assertEq(uint8(position.direction), uint8(PositionDirection.LONG));
        assertEq(uint8(position.status), uint8(PositionStatus.OPEN));
    }

    // ============= Position Tracking Tests =============

    function test_GetUserPositions() public {
        vm.prank(market);
        uint256 id1 = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        vm.prank(market);
        uint256 id2 = positionManager.createPosition(
            user,
            market,
            PositionDirection.SHORT,
            500e18,
            10,
            50000e18
        );

        uint256[] memory positions = positionManager.getUserPositions(user);

        assertEq(positions.length, 2);
        assertEq(positions[0], id1);
        assertEq(positions[1], id2);
    }

    function test_GetUserPositionsInMarket() public {
        vm.prank(market);
        uint256 id1 = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        vm.prank(otherMarket);
        uint256 id2 = positionManager.createPosition(
            user,
            otherMarket,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        vm.prank(market);
        uint256 id3 = positionManager.createPosition(
            user,
            market,
            PositionDirection.SHORT,
            500e18,
            10,
            50000e18
        );

        // Get positions in first market
        uint256[] memory positions = positionManager.getUserPositionsInMarket(user, market);

        assertEq(positions.length, 2);
        assertEq(positions[0], id1);
        assertEq(positions[1], id3);
    }

    // ============= Position Status Tests =============

    function test_UpdatePositionStatus() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        // Update status
        vm.prank(market);
        positionManager.updatePositionStatus(positionId, PositionStatus.LIQUIDATED);

        IPositionManager.Position memory position = positionManager.getPosition(positionId);
        assertEq(uint8(position.status), uint8(PositionStatus.LIQUIDATED));
    }

    // ============= PnL Calculation Tests =============

    function test_CalculateUnrealizedPnL_Long_Profit() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18, // 1000 USD collateral
            5, // 5x leverage
            50000e18 // Entry at $50,000
        );

        uint256 currentPrice = 55000e18; // $55,000 (+10%)
        int256 pnl = positionManager.calculateUnrealizedPnL(positionId, currentPrice);

        // positionSize = 5000, pnl = (55000-50000)/50000 * 5000 = 500
        assertEq(pnl, 500e18);
    }

    function test_CalculateUnrealizedPnL_Long_Loss() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 45000e18; // $45,000 (-10%)
        int256 pnl = positionManager.calculateUnrealizedPnL(positionId, currentPrice);

        // pnl = (45000-50000)/50000 * 5000 = -500
        assertEq(pnl, -500e18);
    }

    function test_CalculateUnrealizedPnL_Short_Profit() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.SHORT,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 45000e18; // Price fell (-10%)
        int256 pnl = positionManager.calculateUnrealizedPnL(positionId, currentPrice);

        // pnl = (50000-45000)/50000 * 5000 = 500
        assertEq(pnl, 500e18);
    }

    function test_CalculateUnrealizedPnL_Short_Loss() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.SHORT,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 55000e18; // Price rose (+10%)
        int256 pnl = positionManager.calculateUnrealizedPnL(positionId, currentPrice);

        // pnl = (50000-55000)/50000 * 5000 = -500
        assertEq(pnl, -500e18);
    }

    // ============= Position Health Tests (perpX-inspired) =============

    function test_CalculateMarginRatio_Healthy() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 52000e18; // Small gain
        int256 marginRatio = positionManager.calculateMarginRatio(positionId, currentPrice);

        // PnL = (52000-50000)/50000 * 5000 = 200
        // Equity = 1000 + 200 = 1200
        // MarginRatio = (1200 * 10000) / 5000 = 2400 bps (24%)
        assertEq(marginRatio, 2400);
    }

    function test_IsMarginBelowMaintenance_Healthy() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            10,
            50000e18
        );

        uint256 currentPrice = 51500e18; // 3% gain
        bool below = positionManager.isMarginBelowMaintenance(positionId, currentPrice);

        // Position is healthy, not below maintenance
        assertFalse(below);
    }

    function test_IsMarginBelowMaintenance_Liquidatable() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            10,
            50000e18
        );

        uint256 currentPrice = 47000e18; // 6% loss - below 5% maintenance
        bool below = positionManager.isMarginBelowMaintenance(positionId, currentPrice);

        // Position is underwater
        assertTrue(below);
    }

    function test_GetPositionHealth_Full() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 50000e18; // No change
        uint256 health = positionManager.getPositionHealth(positionId, currentPrice);

        // Equity = 1000 (no PnL)
        // Health = 1000 / 1000 * 100 = 100%
        assertEq(health, 100);
    }

    function test_GetPositionHealth_Profit() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 52000e18; // 4% gain
        uint256 health = positionManager.getPositionHealth(positionId, currentPrice);

        // PnL = 200
        // Equity = 1200
        // Health = 1200 / 1000 * 100 = 120% (capped at 100)
        assertEq(health, 100);
    }

    function test_GetPositionHealth_Loss() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        uint256 currentPrice = 48000e18; // 4% loss
        uint256 health = positionManager.getPositionHealth(positionId, currentPrice);

        // PnL = -200
        // Equity = 800
        // Health = 800 / 1000 * 100 = 80%
        assertEq(health, 80);
    }

    function test_GetPositionHealth_Liquidated() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            10,
            50000e18
        );

        uint256 currentPrice = 44000e18; // 12% loss - liquidated
        uint256 health = positionManager.getPositionHealth(positionId, currentPrice);

        // Equity < 0
        // Health = 0
        assertEq(health, 0);
    }

    // ============= Position Existence Tests =============

    function test_PositionExists() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        assertTrue(positionManager.positionExists(positionId));
        assertFalse(positionManager.positionExists(9999));
    }

    // ============= Accumulated Funding Tests =============

    function test_UpdateAccumulatedFunding() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        vm.prank(market);
        positionManager.updateAccumulatedFunding(positionId, 50e18);

        IPositionManager.Position memory position = positionManager.getPosition(positionId);
        assertEq(position.accumulatedFunding, 50e18);
    }

    function test_UpdateAccumulatedFunding_Multiple() public {
        vm.prank(market);
        uint256 positionId = positionManager.createPosition(
            user,
            market,
            PositionDirection.LONG,
            1000e18,
            5,
            50000e18
        );

        vm.prank(market);
        positionManager.updateAccumulatedFunding(positionId, 50e18);

        vm.prank(market);
        positionManager.updateAccumulatedFunding(positionId, 30e18);

        IPositionManager.Position memory position = positionManager.getPosition(positionId);
        assertEq(position.accumulatedFunding, 80e18);
    }
}
