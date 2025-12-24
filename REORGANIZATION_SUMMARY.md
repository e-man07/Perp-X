# Contract Reorganization Summary

## Changes Made

### Directory Structure
- **Old:** Contracts were in `src/` directory
- **New:** Contracts moved to `contracts/` directory

### Files Updated

1. **foundry.toml**
   - Changed `src = "src"` to `src = "contracts"`

2. **Scripts** (2 files)
   - `script/Deploy.s.sol` - Updated all imports from `../src/` to `../contracts/`
   - `script/CreateMarkets.s.sol` - Updated imports

3. **Tests** (3 files)
   - `test/unit/CollateralVault.t.sol` - Updated imports
   - `test/unit/PositionManager.t.sol` - Updated imports
   - `test/unit/Math.t.sol` - Updated imports

4. **Documentation** (2 files)
   - `README.md` - Updated project structure section
   - `ARCHITECTURE.md` - Updated directory references

### Directory Structure

```
contracts/
├── collateral/
│   └── CollateralVault.sol
├── core/
│   ├── OutcomeMarket.sol
│   ├── OutcomePerpsFactory.sol
│   ├── OutcomePerpsFactorySimple.sol
│   ├── OutcomePerpsFactoryV2.sol
│   ├── OutcomePerpsFactoryV3.sol
│   └── PositionManager.sol
├── interfaces/
│   ├── ICollateralVault.sol
│   ├── ILiquidationEngine.sol
│   ├── IOutcomeMarket.sol
│   ├── IPositionManager.sol
│   └── IPyth.sol
├── libraries/
│   ├── Math.sol
│   └── Oracle.sol
├── liquidation/
│   ├── InsuranceFund.sol
│   └── LiquidationEngine.sol
├── mocks/
│   └── MockERC20.sol
└── oracle/
    └── PythPriceAdapter.sol
```

### Verification
- ✅ All contracts compile successfully
- ✅ All imports updated correctly
- ✅ Old `src/` directory removed
- ✅ Build passes with only minor warnings (unused variables)

### Benefits
- Clearer project structure
- Standard Foundry convention (contracts/ directory)
- Easier to distinguish contracts from other source code
- Better organization for larger projects

