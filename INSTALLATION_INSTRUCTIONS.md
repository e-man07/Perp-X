# Installation Instructions for cargo-stylus

## Current Status

The `cargo stylus build` command failed because `cargo-stylus` is not installed. Here's how to install it:

## Installation Steps

### Option 1: Standard Installation (Recommended)

```bash
# 1. Ensure Rust is installed
rustc --version

# 2. Add WASM target
rustup target add wasm32-unknown-unknown

# 3. Install cargo-stylus
cargo install --force cargo-stylus
```

### Option 2: If SSL Certificate Issues Occur

**On macOS:**

```bash
# Install certificates via Homebrew
brew install ca-certificates

# Set SSL certificate path
export SSL_CERT_FILE=$(brew --prefix)/etc/ca-certificates/cert.pem

# Then install
cargo install --force cargo-stylus
```

**On Linux:**

```bash
# Update certificates
sudo update-ca-certificates

# Set SSL certificate path
export SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

# Then install
cargo install --force cargo-stylus
```

### Option 3: Build from Source

If `cargo install` continues to fail:

```bash
# Clone the repository
git clone https://github.com/OffchainLabs/cargo-stylus.git
cd cargo-stylus

# Build from source
cargo build --release

# Install locally
cargo install --path . --force
```

### Option 4: Use Pre-built Binary

Check the [cargo-stylus releases](https://github.com/OffchainLabs/cargo-stylus/releases) for pre-built binaries.

## Verify Installation

After installation, verify it works:

```bash
cargo stylus --version
```

You should see something like:
```
cargo-stylus 0.x.x
```

## Build Contracts

Once `cargo-stylus` is installed:

```bash
cd stylus
cargo stylus build
```

This will compile all contracts to WebAssembly format.

## Alternative: Check Code Without cargo-stylus

You can still check if the Rust code compiles correctly using regular cargo:

```bash
cd stylus
cargo check
```

This will verify syntax and type checking without generating WASM files.

## Troubleshooting

### Issue: "no such command: `stylus`"

**Solution**: `cargo-stylus` is not installed. Follow installation steps above.

### Issue: SSL Certificate Errors

**Solution**: Set the `SSL_CERT_FILE` environment variable (see Option 2 above).

### Issue: Network/Proxy Issues

**Solution**: 
```bash
# Set proxy if behind firewall
export HTTP_PROXY=http://your-proxy:port
export HTTPS_PROXY=http://your-proxy:port
```

### Issue: Permission Denied

**Solution**: Install to user directory:
```bash
cargo install --force --root ~/.local cargo-stylus
export PATH=$HOME/.local/bin:$PATH
```

## Next Steps

1. Install `cargo-stylus` using one of the methods above
2. Verify installation: `cargo stylus --version`
3. Build contracts: `cd stylus && cargo stylus build`
4. Export ABI: `cargo stylus export-abi`
5. Deploy: See `stylus/DEPLOYMENT.md`

## Resources

- [Stylus Documentation](https://docs.arbitrum.io/stylus)
- [cargo-stylus GitHub](https://github.com/OffchainLabs/cargo-stylus)
- [Stylus SDK Reference](https://docs.rs/stylus-sdk/)


