# Solidity Contracts Removal Plan

## Overview

As part of the Stylus migration, all Solidity contracts are being removed. The project now uses Rust contracts exclusively via Arbitrum Stylus.

## Files to Remove

### Contracts Directory
- `contracts/core/` - All Solidity core contracts
- `contracts/collateral/` - Collateral vault
- `contracts/liquidation/` - Liquidation engine and insurance fund
- `contracts/oracle/` - Pyth price adapter
- `contracts/interfaces/` - Solidity interfaces (replaced by Rust types)
- `contracts/libraries/` - Math and Oracle libraries (rewritten in Rust)
- `contracts/mocks/` - Mock contracts (if not needed)

### Deployment Scripts
- `script/Deploy.s.sol` - Solidity deployment script (replaced by cargo-stylus)
- `script/CreateMarkets.s.sol` - Market creation script (rewritten in Rust)

### Foundry Configuration
- `foundry.toml` - May be kept for reference or removed
- `foundry.lock` - Can be removed

### Build Artifacts
- `out/` - Solidity build artifacts (can be regenerated if needed)
- `cache/` - Foundry cache

## What to Keep

- `stylus/` - New Rust contracts directory
- `frontend/` - Frontend code (will be updated with new ABIs)
- `test/` - Test files (may need to be rewritten for Stylus)
- Documentation files

## Migration Status

✅ **Stylus contracts created** - Core structure in place
🔄 **Contracts in progress** - Some contracts still being migrated
⚠️ **Keep Solidity as reference** - Until migration is 100% complete

## Removal Command

Once migration is complete:

```bash
# Remove Solidity contracts
rm -rf contracts/

# Remove Solidity deployment scripts
rm -rf script/

# Remove Foundry config (optional)
rm foundry.toml foundry.lock

# Remove build artifacts
rm -rf out/ cache/
```

## Note

The Solidity contracts serve as reference during migration. Consider keeping them until all Stylus contracts are complete and tested.

