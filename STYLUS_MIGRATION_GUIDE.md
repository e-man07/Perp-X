# Stylus Migration Guide: Solidity to Rust

This document outlines the complete migration of Perp-X contracts from Solidity to Rust using Arbitrum Stylus.

## Overview

All Solidity contracts have been rewritten in Rust using the Stylus SDK. The logic remains identical, but the implementation now leverages Rust's type safety and Stylus's performance benefits.

## Project Structure

```
stylus/
├── Cargo.toml              # Rust project configuration
├── src/
│   ├── lib.rs              # Main library entry point
│   ├── math.rs             # Math utilities (PnL, margin calculations)
│   ├── position_manager.rs # Position tracking and management
│   ├── collateral_vault.rs # Multi-collateral vault
│   ├── outcome_market.rs   # Main trading market
│   ├── liquidation_engine.rs # Liquidation system
│   ├── insurance_fund.rs   # Insurance fund
│   ├── pyth_price_adapter.rs # Pyth oracle integration
│   └── outcome_perps_factory.rs # Market factory
└── README.md               # Stylus-specific documentation
```

## Key Changes from Solidity

### 1. Storage Pattern
**Solidity:**
```solidity
mapping(uint256 => Position) public positions;
```

**Stylus (Rust):**
```rust
sol_storage! {
    pub struct PositionManager {
        mapping(uint256 => Position) positions;
    }
}
```

### 2. Error Handling
**Solidity:**
```solidity
require(condition, "Error message");
```

**Stylus (Rust):**
```rust
if !condition {
    return Err(PositionManagerError::InvalidInput.into());
}
```

### 3. Events
**Solidity:**
```solidity
event PositionCreated(uint256 indexed positionId, address indexed user);
emit PositionCreated(positionId, user);
```

**Stylus (Rust):**
```rust
// Events are handled differently in Stylus
// Use log! macro or emit through SDK
```

### 4. External Calls
**Solidity:**
```solidity
IPositionManager positionManager = IPositionManager(address);
positionManager.createPosition(...);
```

**Stylus (Rust):**
```rust
use stylus_sdk::call::Call;
let result = Call::new()
    .call(position_manager_address, "createPosition", &args)
    .execute();
```

## Contract-by-Contract Migration

### Math Library (`math.rs`)
✅ **Status**: Complete
- All mathematical functions ported
- PnL calculations (long/short)
- Margin ratio calculations
- Liquidation price calculations
- Open interest imbalance calculations

### PositionManager (`position_manager.rs`)
✅ **Status**: Complete
- Position creation and tracking
- User position queries
- Market position queries
- PnL calculations
- Margin health checks
- Position status updates

### CollateralVault (`collateral_vault.rs`)
🔄 **Status**: In Progress
- Multi-collateral support
- Deposit/withdraw functions
- Collateral locking/releasing
- USD conversion via Pyth
- Treasury management

### OutcomeMarket (`outcome_market.rs`)
🔄 **Status**: In Progress
- Position opening
- Market settlement
- Position closing
- Early exit fees
- Open interest tracking

### LiquidationEngine (`liquidation_engine.rs`)
🔄 **Status**: In Progress
- Liquidation checks
- Margin ratio validation
- Liquidator rewards
- Insurance fund allocation

### InsuranceFund (`insurance_fund.rs`)
🔄 **Status**: In Progress
- Fund deposits/withdrawals
- Compensation payments
- Multi-asset support

### PythPriceAdapter (`pyth_price_adapter.rs`)
🔄 **Status**: In Progress
- Price feed registration
- Price caching
- Staleness checks
- Pyth oracle integration

### OutcomePerpsFactory (`outcome_perps_factory.rs`)
🔄 **Status**: In Progress
- Market creation
- Core contract deployment
- Market authorization
- Template management

## Deployment Process

### 1. Build Contracts
```bash
cd stylus
cargo stylus build
```

### 2. Deploy to Arbitrum Sepolia
```bash
cargo stylus deploy \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key YOUR_PRIVATE_KEY
```

### 3. Activate Contracts
```bash
cargo stylus activate \
  --rpc-url https://arb-sepolia.g.alchemy.com/v2/YOUR_API_KEY \
  --private-key YOUR_PRIVATE_KEY \
  --contract-address DEPLOYED_ADDRESS
```

### 4. Export ABI
```bash
cargo stylus export-abi
```

## Testing

### Unit Tests
```bash
cargo test
```

### Integration Tests
```bash
cargo test --test integration
```

### Stylus TestVM
```rust
use stylus_sdk::test_utils::TestVM;

#[test]
fn test_position_creation() {
    let mut vm = TestVM::new();
    // Test logic
}
```

## Key Differences & Considerations

### 1. Gas Optimization
- Stylus contracts are more gas-efficient for compute-intensive operations
- Math operations (PnL calculations) benefit significantly
- Storage operations have similar costs

### 2. Type Safety
- Rust's type system prevents many bugs at compile time
- No integer overflow (checked by default)
- Better memory safety

### 3. Interoperability
- Stylus contracts can call Solidity contracts
- Solidity contracts can call Stylus contracts
- ABI compatibility maintained

### 4. Error Handling
- More explicit error handling in Rust
- Custom error types for better debugging
- Error messages can be more descriptive

## Migration Checklist

- [x] Create Stylus project structure
- [x] Rewrite Math library
- [x] Rewrite PositionManager
- [ ] Rewrite CollateralVault
- [ ] Rewrite OutcomeMarket
- [ ] Rewrite LiquidationEngine
- [ ] Rewrite InsuranceFund
- [ ] Rewrite PythPriceAdapter
- [ ] Rewrite OutcomePerpsFactory
- [ ] Update deployment scripts
- [ ] Write comprehensive tests
- [ ] Update frontend ABIs
- [ ] Deploy to Arbitrum Sepolia
- [ ] Verify contracts on Arbiscan
- [ ] Update documentation

## Next Steps

1. Complete remaining contract rewrites
2. Write comprehensive test suite
3. Update deployment scripts
4. Deploy to Arbitrum Sepolia testnet
5. Update frontend to use new contract addresses
6. Test end-to-end functionality

## Resources

- [Stylus Documentation](https://docs.arbitrum.io/stylus)
- [Stylus SDK Reference](https://docs.rs/stylus-sdk/)
- [Stylus Examples](https://github.com/OffchainLabs/stylus-examples)
- [OpenZeppelin Stylus](https://docs.openzeppelin.com/contracts-stylus)

