# Known limitations

Stated plainly so an auditor starts from the truth.

- No independent audit, penetration test or formal verification has been done.
- Privileged roles are single Testnet keys. Multisig policy is configured but not enforced on-chain.
- Server-held keys use one master key, not a managed vault or HSM.
- No fuzzing or property-based testing yet; invariants are covered by unit and scenario tests.
- Storage TTL and extension policy need a production design.
- Signed document uploads are implemented and unit-tested but untested against a real bucket.
- Risk and expected-loss models are rule-based internal estimates with configurable assumptions, not calibrated on real default data, not regulated ratings.
- Performance is measured only by a local load simulation, not on Testnet or a staging environment.
- The settlement asset is VTAED, a Testnet test asset. No Mainnet stablecoin or payment rail is configured.
- Legal agreements, asset ownership and security structure, licensing and custody are unresolved and are regulatory dependencies.
- The public website runs Demo mode; the Alpha path ran in an isolated test environment.
