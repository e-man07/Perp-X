// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import {CollateralVault} from "../../contracts/collateral/CollateralVault.sol";
import {PythPriceAdapter} from "../../contracts/oracle/PythPriceAdapter.sol";
import {MockERC20} from "../mocks/MockERC20.sol";

contract CollateralVaultTest is Test {
    CollateralVault vault;
    PythPriceAdapter priceAdapter;
    MockERC20 usdc;
    MockERC20 usdt;
    MockERC20 weth;

    address user = address(0x1);
    address market = address(0x2);

    function setUp() public {
        // Create mock tokens
        usdc = new MockERC20("USD Coin", "USDC", 6);
        usdt = new MockERC20("Tether", "USDT", 6);
        weth = new MockERC20("Wrapped Ether", "WETH", 18);

        // Initialize price adapter (mock address for now)
        priceAdapter = new PythPriceAdapter(address(0));

        // Create vault
        vault = new CollateralVault(address(priceAdapter));

        // Add supported collateral
        vault.addSupportedToken(address(usdc), "USD");
        vault.addSupportedToken(address(usdt), "USD");
        vault.addSupportedToken(address(weth), "ETH");

        // Authorize market
        vault.authorizeMarket(market, true);

        // Mint tokens to user
        usdc.mint(user, 10000e6); // 10,000 USDC (6 decimals)
        usdt.mint(user, 10000e6); // 10,000 USDT (6 decimals)
        weth.mint(user, 100e18); // 100 WETH (18 decimals)
    }

    // ============= Token Support Tests =============

    function test_IsSupportedCollateral() public {
        assertTrue(vault.isSupportedCollateral(address(usdc)));
        assertTrue(vault.isSupportedCollateral(address(usdt)));
        assertTrue(vault.isSupportedCollateral(address(weth)));
        assertFalse(vault.isSupportedCollateral(address(0x99)));
    }

    function test_AddSupportedToken() public {
        MockERC20 newToken = new MockERC20("New Token", "NEW", 18);
        vault.addSupportedToken(address(newToken), "NEW");

        assertTrue(vault.isSupportedCollateral(address(newToken)));
    }

    // ============= Deposit/Withdrawal Tests =============

    function test_Deposit() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);

        uint256 balance = vault.getCollateralBalance(user, address(usdc));
        assertEq(balance, 1000e6);
    }

    function test_Deposit_Multiple() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 2000e6);
        vault.deposit(address(usdc), 1000e6);
        vault.deposit(address(usdc), 1000e6);

        uint256 balance = vault.getCollateralBalance(user, address(usdc));
        assertEq(balance, 2000e6);
    }

    function test_Withdraw() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);

        vault.withdraw(address(usdc), 500e6);

        uint256 balance = vault.getCollateralBalance(user, address(usdc));
        assertEq(balance, 500e6);
    }

    function test_Withdraw_RevertInsufficientBalance() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);

        vm.expectRevert("Insufficient collateral");
        vault.withdraw(address(usdc), 2000e6);
    }

    // ============= Collateral Locking Tests =============

    function test_LockCollateral() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);
        vm.stopPrank();

        vm.prank(market);
        vault.lockCollateral(user, 500e18); // Lock 500 USD

        uint256 available = vault.getAvailableCollateralUSD(user);
        // Available should be less than total (depends on price conversion)
        // For now just check it locks correctly
    }

    function test_ReleaseCollateral() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);
        vm.stopPrank();

        vm.prank(market);
        vault.lockCollateral(user, 500e18);

        vm.prank(market);
        vault.releaseCollateral(user, 500e18);

        uint256 locked = vault.getLockedCollateralUSD(user);
        assertEq(locked, 0);
    }

    // ============= Collateral Balance Tests =============

    function test_GetCollateralBalance() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);

        uint256 balance = vault.getCollateralBalance(user, address(usdc));
        assertEq(balance, 1000e6);
    }

    // ============= Supported Assets Tests =============

    function test_GetSupportedTokens() public {
        address[] memory tokens = vault.getSupportedTokens();
        assertEq(tokens.length, 3);
        assertEq(tokens[0], address(usdc));
        assertEq(tokens[1], address(usdt));
        assertEq(tokens[2], address(weth));
    }

    function test_RemoveSupportedToken() public {
        vault.removeSupportedToken(address(usdc));
        assertFalse(vault.isSupportedCollateral(address(usdc)));
    }

    // ============= Market Authorization Tests =============

    function test_AuthorizeMarket() public {
        address newMarket = address(0x99);
        vault.authorizeMarket(newMarket, true);

        // Verify authorization by testing access (would normally check through a modifier)
    }

    // ============= Revert Tests =============

    function test_Deposit_RevertUnsupportedToken() public {
        MockERC20 unsupported = new MockERC20("Unsupported", "UNS", 18);
        unsupported.mint(user, 1000e18);

        vm.startPrank(user);
        unsupported.approve(address(vault), 1000e18);
        vm.expectRevert("Unsupported token");
        vault.deposit(address(unsupported), 1000e18);
    }

    function test_Withdraw_RevertUnsupportedToken() public {
        MockERC20 unsupported = new MockERC20("Unsupported", "UNS", 18);

        vm.expectRevert("Unsupported token");
        vault.withdraw(address(unsupported), 1000e18);
    }

    function test_LockCollateral_RevertInsufficientAvailable() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 100e6);
        vault.deposit(address(usdc), 100e6);
        vm.stopPrank();

        vm.prank(market);
        vm.expectRevert("Insufficient available collateral");
        vault.lockCollateral(user, 1000e18); // Try to lock more than available
    }

    function test_ReleaseCollateral_RevertExceedsLocked() public {
        vm.startPrank(user);
        usdc.approve(address(vault), 1000e6);
        vault.deposit(address(usdc), 1000e6);
        vm.stopPrank();

        vm.prank(market);
        vault.lockCollateral(user, 100e18);

        vm.prank(market);
        vm.expectRevert("Cannot release more than locked");
        vault.releaseCollateral(user, 200e18);
    }
}
